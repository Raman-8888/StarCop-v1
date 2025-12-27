import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDaCEMzrHElM7HEb-B73pTd6LADTliXi_M",
    authDomain: "starcop-c1156.firebaseapp.com",
    projectId: "starcop-c1156",
    storageBucket: "starcop-c1156.firebasestorage.app",
    messagingSenderId: "250200129956",
    appId: "1:250200129956:web:067170bc1d864d04128131",
    measurementId: "G-DTQN9W09QF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.error('Permission not granted for Notification');
            return null;
        }

        // Explicitly register service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ Service Worker registered:', registration);

        const currentToken = await getToken(messaging, {
            serviceWorkerRegistration: registration,
            // vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' 
        });

        if (currentToken) {
            console.log('✅ FCM Token generated:', currentToken);
            return currentToken;
        } else {
            console.log('❌ No registration token available. Request permission to generate one.');
            return null;
        }
    } catch (err) {
        console.error('❌ An error occurred while retrieving token. ', err);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

export { messaging };
