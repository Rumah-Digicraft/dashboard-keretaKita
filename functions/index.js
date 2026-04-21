const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { google } = require("googleapis");
const cors = require("cors")({ origin: true });

// Initialize Firebase Admin
// We use the service account we found in the root, but for production
// it's better to set GOOGLE_APPLICATION_CREDENTIALS or let it infer from environment.
// For now, we will load it relative to this file if deployed, OR rely on default creds.
// However, the Google Play API requires specific scopes that default credential might not have access to
// without the specific service account key.
// We will assume the key file is deployed with the functions or use the Service Account attached to the function.
// For simplicity in this plan, we'll try to use the key file if present in the functions dir, 
// OR simpler: we rely on ADC (Application Default Credentials) if the service account has rights.

admin.initializeApp();

// Scope for Google Play Developer API
const SCOPES = ["https://www.googleapis.com/auth/androidpublisher"];
const PACKAGE_NAME = "id.ardev.keretakita";
const SERVICE_ACCOUNT_FILE = "./service-account.json"; // We will ask user to copy it here

// Helper to authenticate
async function getAuthenticatedClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
  });
  return await auth.getClient();
}

/**
 * Fetch Reviews
 * GET /getReviews
 */
exports.getReviews = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const authClient = await getAuthenticatedClient();
      const androidpublisher = google.androidpublisher({ version: "v3", auth: authClient });

      const response = await androidpublisher.reviews.list({
        packageName: PACKAGE_NAME,
        maxResults: 10,
      });

      // Transform data for frontend
      const reviews = response.data.reviews || [];
      const formattedReviews = reviews.map((r) => {
          const comment = r.comments[0].userComment;
          const reply = r.comments.length > 1 ? r.comments[1].developerComment : null;
          
          return {
              reviewId: r.reviewId,
              authorName: r.authorName,
              starRating: comment.starRating,
              text: comment.text.trim(),
              createTime: new Date(comment.lastModified.seconds * 1000).toISOString(),
              reply: reply ? {
                  text: reply.text.trim(),
                  lastModifiedTime: new Date(reply.lastModified.seconds * 1000).toISOString()
              } : null
          };
      });

      res.status(200).json({ success: true, reviews: formattedReviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

/**
 * Reply to Review
 * POST /replyReview
 * body: { reviewId: string, replyText: string }
 */
exports.replyReview = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { reviewId, replyText } = req.body;

    if (!reviewId || !replyText) {
      return res.status(400).json({ success: false, error: "Missing parameters" });
    }

    try {
      const authClient = await getAuthenticatedClient();
      const androidpublisher = google.androidpublisher({ version: "v3", auth: authClient });

      await androidpublisher.reviews.reply({
        packageName: PACKAGE_NAME,
        reviewId: reviewId,
        requestBody: {
          replyText: replyText,
        },
      });

      res.status(200).json({ success: true, message: "Reply posted successfully" });
    } catch (error) {
      console.error("Error replying to review:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});
