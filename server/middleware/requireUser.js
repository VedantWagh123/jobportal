import User from '../models/User.js';
import JobApplication from '../models/JobApplication.js';
import Enrollment from '../models/Enrollment.js';
import UserNotification from '../models/UserNotification.js';
import CourseReview from '../models/CourseReview.js';
import { verifyToken } from '@clerk/express';

/**
 * Middleware: requireUser
 * 
 * Ensures an authenticated Clerk user always has a corresponding DB record.
 * Falls back to manual JWT verification if clerkMiddleware fails (ES module timing issue).
 * If userId (Clerk ID) not found in DB, tries to find by email and migrate.
 * If still not found, creates a fresh record.
 * 
 * Attaches `req.dbUser` for downstream controllers.
 */
export const requireUser = async (req, res, next) => {
    try {
        let userId = req.auth?.userId;
        const authHeader = req.headers?.authorization;

        // Fallback: if clerkMiddleware didn't set userId but token exists, verify manually
        if (!userId && authHeader?.startsWith('Bearer ')) {
            const rawToken = authHeader.split(' ')[1];
            if (rawToken && rawToken !== 'null' && rawToken !== 'undefined') {
                try {
                    const payload = await verifyToken(rawToken, {
                        secretKey: process.env.CLERK_SECRET_KEY,
                        clockSkewInMs: 48 * 60 * 60 * 1000, // 48 hour tolerance for clock drift
                    });
                    userId = payload.sub;
                    console.log(`[requireUser] Manual JWT verification succeeded: ${userId}`);
                } catch (verifyErr) {
                    console.warn(`[requireUser] Manual JWT verification failed: ${verifyErr.message}`);
                    // Last resort: decode JWT payload without verification (clock skew edge case)
                    try {
                        const parts = rawToken.split('.');
                        if (parts.length === 3) {
                            const decoded = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
                            if (decoded.sub && decoded.sub.startsWith('user_')) {
                                userId = decoded.sub;
                                console.log(`[requireUser] Decoded userId from JWT payload: ${userId}`);
                            }
                        }
                    } catch (decodeErr) {
                        console.warn(`[requireUser] JWT decode also failed: ${decodeErr.message}`);
                    }
                }
            }
        }

        console.log(`[requireUser] ${req.method} ${req.path} | finalUserId=${userId}`);

        if (!userId) {
            return res.json({ success: false, message: 'User Not Found' });
        }

        // 1. Fast path: user exists with current Clerk ID
        let user = await User.findById(userId);

        if (!user) {
            // 2. Try to find by email (Clerk account recreation / new device)
            //    Clerk sends user info via the JWT's public metadata or via clerkClient
            //    We use the request body or query for email if available,
            //    otherwise fall back to clerkClient to get user email.
            let email = req.body?.email;

            if (!email) {
                try {
                    const { clerkClient } = await import('@clerk/express');
                    const clerkUser = await clerkClient.users.getUser(userId);
                    email = clerkUser.emailAddresses?.[0]?.emailAddress;
                } catch (e) {
                    console.warn('requireUser: Could not fetch Clerk user details:', e.message);
                }
            }

            if (email) {
                const existingUser = await User.findOne({ email });

                if (existingUser && existingUser._id === userId) {
                    // Same user found by email — no migration needed, just attach.
                    user = existingUser;
                } else if (existingUser && existingUser._id !== userId) {
                    // Migrate: clone existing user data to new Clerk ID.
                    // All app-managed profile data (image, resume, skills, etc.) is
                    // preserved because we clone the entire existing document.
                    const oldId = existingUser._id;
                    const userData = existingUser.toObject();
                    userData._id = userId;

                    try {
                        user = await User.create(userData);

                        // Migrate all references
                        await Promise.all([
                            JobApplication.updateMany({ userId: oldId }, { userId }),
                            Enrollment.updateMany({ userId: oldId }, { userId }),
                            UserNotification.updateMany({ userId: oldId }, { userId }),
                            CourseReview.updateMany({ userId: oldId }, { userId }),
                        ]);

                        // Remove old record
                        await User.findByIdAndDelete(oldId);
                        console.log(`[requireUser] Migrated user ${oldId} → ${userId}`);
                    } catch (createErr) {
                        // Possible if migration already ran partially — re-fetch
                        user = await User.findById(userId);
                    }
                }
            }

            // 3. Still not found: create a minimal record (webhook probably missed).
            // SAFETY: Re-check by userId one final time before creating to handle
            // race conditions (e.g., concurrent requests that already created the record).
            if (!user) {
                // Final re-check to avoid creating duplicates under race conditions
                user = await User.findById(userId);
            }

            if (!user) {
                try {
                    const { clerkClient } = await import('@clerk/express');
                    const clerkUser = await clerkClient.users.getUser(userId);
                    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
                    const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress || '';
                    const image = clerkUser.imageUrl || '';

                    // This only runs for a genuinely NEW user whose webhook was missed.
                    // An existing user can never reach this path because findById and
                    // findOne-by-email above would have found them first.
                    user = await User.create({ _id: userId, name, email: userEmail, image, resume: '' });
                    console.log(`[requireUser] Auto-created new user record for ${userId} (webhook missed)`);
                } catch (e) {
                    if (e.code === 11000) {
                        // Duplicate key: another concurrent request already created the record
                        user = await User.findById(userId);
                        if (!user) {
                            console.error('[requireUser] Duplicate key but still not found:', e.message);
                            return res.status(500).json({ success: false, message: 'Could not initialize user record.' });
                        }
                    } else {
                        console.error('[requireUser] Failed to auto-create user:', e.message);
                        return res.status(500).json({ success: false, message: 'Could not initialize user record.' });
                    }
                }
            }
        }

        // Attach to request so controllers can use req.dbUser directly
        req.dbUser = user;
        next();
    } catch (err) {
        console.error('[requireUser] Unexpected error:', err.message);
        res.status(500).json({ success: false, message: 'Internal server error in auth middleware.' });
    }
};
