## TikTok-styled Livestream Shopping Using Next.js Firebase, and Stream

This project is built with Next.js, Firebase, and the Stream Chat SDK. 

## Getting Started

- Clone the GitHub repository
- Install the package dependencies.
  ```bash
  npm install
  ```
- Create a [Firebase app with Authentication and Firebase Firestore features](https://firebase.google.com/)

- Update the [firebase.ts](https://github.com/dha-stix/stream-loom-clone/blob/main/src/lib/firebase.ts) file with your Firebase configuration code.

- Create your [Stream account](https://getstream.io/try-for-free/) and also add your Stream credentials into the **`env.local`** file.

  ```bash
  NEXT_PUBLIC_IMAGE_URL=https://api.dicebear.com/9.x/pixel-art/svg?seed=
  NEXT_PUBLIC_STREAM_API_KEY=
  STREAM_SECRET_KEY=
  ```
- Install the [Stream Chat extension](https://extensions.dev/extensions/stream/auth-chat) to your Firebase app.
  
- Finally, start the development server by running the code snippet below:
  ```bash
  npm run dev
  ```

## Tools

👉🏻 [Stream Chat SDK](https://getstream.io/chat/)

👉🏻 [Stream Chat x Firebase Extension](https://extensions.dev/extensions/stream/auth-chat)
