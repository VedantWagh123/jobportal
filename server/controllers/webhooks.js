import { Webhook } from "svix";
import User from "../models/User.js";

// API Controller Function to Manage Clerk User with database
export const clerkWebhooks = async (req, res) => {
    try {

        // Create a Svix instance with clerk webhook secret.
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        // Verifying Headers
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        })

        // Getting Data from request body
        const { data, type } = req.body

        // Switch Cases for differernt Events
        switch (type) {
            case 'user.created': {

                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    image: data.image_url,
                    resume: ''
                }
                await User.create(userData)
                res.json({})
                break;
            }

            case 'user.updated': {
                // SAFETY: Only update Clerk-managed identity fields (name, email).
                // NEVER overwrite `image` here — the user may have uploaded a custom
                // Cloudinary profile picture. Overwriting it with Clerk's image_url
                // would silently destroy their uploaded photo on every Clerk event.
                const clerkUpdateFields = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                };

                // Only sync image if the user still has Clerk's own CDN URL
                // (meaning they never uploaded a custom profile picture).
                const existingUser = await User.findById(data.id).select('image');
                const hasCustomImage = existingUser?.image &&
                    !existingUser.image.includes('clerk.com') &&
                    !existingUser.image.includes('img.clerk') &&
                    !existingUser.image.includes('gravatar.com');

                if (!hasCustomImage) {
                    clerkUpdateFields.image = data.image_url;
                }

                await User.findByIdAndUpdate(data.id, { $set: clerkUpdateFields });
                res.json({})
                break;
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id)
                res.json({})
                break;
            }
            default:
                break;
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}