importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyDaCEMzrHElM7HEb-B73pTd6LADTliXi_M",
    authDomain: "starcop-c1156.firebaseapp.com",
    projectId: "starcop-c1156",
    storageBucket: "starcop-c1156.firebasestorage.app",
    messagingSenderId: "250200129956",
    appId: "1:250200129956:web:067170bc1d864d04128131",
    measurementId: "G-DTQN9W09QF"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/vite.svg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
