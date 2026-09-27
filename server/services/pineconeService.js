import { Pinecone } from '@pinecone-database/pinecone';

class PineconeService {
    constructor() {
        this.client = null;
        this.index = null;
        this.isReady = false;
    }

    init() {
        if (this.isReady) return;
        
        if (process.env.PINECONE_API_KEY) {
            try {
                this.client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
                const indexName = process.env.PINECONE_INDEX_NAME || "job-portal";
                this.index = this.client.index(indexName);
                this.isReady = true;
                console.log(`Pinecone Initialized for index: ${indexName}`);
            } catch (error) {
                console.warn("Pinecone Initialization Error:", error.message);
            }
        } else {
             console.log("Pinecone API Key not found in .env. Skipping Vector DB initialization (Falling back to MongoDB logic).");
        }
    }

    async upsertVector(namespace, id, vector, metadata = {}) {
        if (!this.isReady || !vector || vector.length === 0) return false;
        try {
            await this.index.namespace(namespace).upsert([{
                id: id.toString(),
                values: vector,
                metadata
            }]);
            return true;
        } catch (error) {
            console.warn(`Pinecone Upsert Error (${namespace}):`, error.message);
            return false;
        }
    }

    async queryVector(namespace, vector, topK = 100) {
        if (!this.isReady || !vector || vector.length === 0) return null;
        try {
            const response = await this.index.namespace(namespace).query({
                vector,
                topK,
                includeMetadata: true
            });
            return response.matches;
        } catch (error) {
            console.warn(`Pinecone Query Error (${namespace}):`, error.message);
            return null;
        }
    }
}

export default new PineconeService();
