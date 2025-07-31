/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
const {google} = require("googleapis");

// The ID of the Google Calendar to create events on.
// This should be the calendar ID, not the web URL

const CALENDAR_ID = "sistercirclesessions@gmail.com";

// Test function to check Google Calendar access
exports.testGoogleCalendar = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required.",
    );
  }

  console.log("Testing Google Calendar access...");

  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({version: "v3", auth});

    // Try to get calendar info
    const calendarInfo = await calendar.calendars.get({
      calendarId: CALENDAR_ID,
    });

    return {
      success: true,
      message: "Google Calendar access is working",
      calendarId: CALENDAR_ID,
      calendarSummary: calendarInfo.data.summary,
      calendarDescription: calendarInfo.data.description,
    };
  } catch (error) {
    console.error("Error testing Google Calendar:", error);

    return {
      success: false,
      error: error.message,
      code: error.code,
      message: "Google Calendar test failed",
    };
  }
});

// This function creates a Google Calendar event with a Meet link
exports.createGoogleMeet = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required.",
    );
  }

  const {mentorEmail, menteeEmail, topic} = data;

  if (!mentorEmail || !menteeEmail) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Mentor and mentee emails are required.",
    );
  }

  console.log("Creating Google Meet for:", {mentorEmail, menteeEmail, topic});

  try {
    // Use application default credentials or service account
    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({version: "v3", auth});

    // Set event time to 30 minutes from now
    const eventStartTime = new Date();
    const eventEndTime = new Date(eventStartTime.getTime() + 30 * 60 * 1000);

    console.log("Creating calendar event with times:", {
      start: eventStartTime.toISOString(),
      end: eventEndTime.toISOString(),
    });

    const event = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      conferenceDataVersion: 1, // Required to generate a new Meet link
      requestBody: {
        summary: topic || "SisterCircle Mentorship Session",
        description: "A micro-mentorship session on SisterCircle.",
        start: {dateTime: eventStartTime.toISOString()},
        end: {dateTime: eventEndTime.toISOString()},
        // This part creates the Google Meet link
        conferenceData: {
          createRequest: {
            requestId: `sistercircle-${Date.now()}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
        attendees: [
          {email: mentorEmail},
          {email: menteeEmail},
        ],
      },
    });

    console.log("Calendar event created:", event.data);

    // Check if we got a Meet link
    if (!event.data.hangoutLink) {
      console.error("No Meet link generated in response:", event.data);
      throw new functions.https.HttpsError(
          "internal",
          "Failed to generate Google Meet link.",
      );
    }

    // Return the generated Google Meet link
    return {
      meetLink: event.data.hangoutLink,
      eventId: event.data.id,
    };
  } catch (error) {
    console.error("Error creating Google Meet event:", error);

    // Provide more specific error messages
    if (error.code === 403) {
      throw new functions.https.HttpsError(
          "permission-denied",
          "Calendar access denied. Please check calendar permissions.",
      );
    } else if (error.code === 404) {
      throw new functions.https.HttpsError(
          "not-found",
          "Calendar not found. Please check the calendar ID.",
      );
    } else {
      throw new functions.https.HttpsError(
          "internal",
          "Failed to create video call: " + error.message,
      );
    }
  }
});
