import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, onValue, push, update } from "firebase/database";

class FirebaseService {
    firebaseConfig = {
        apiKey: "AIzaSyA5Og8fwj8qlPfrTX2FZKSlP3R4xqGi9d4",
        authDomain: "students-88274.firebaseapp.com",
        projectId: "students-88274",
        storageBucket: "students-88274.appspot.com",
        messagingSenderId: "1041934476796",
        appId: "1:1041934476796:web:85f2f00462b55d175b7e79",
        measurementId: "G-Q6M4M22ZZV",
        databaseURL: "https://students-88274-default-rtdb.europe-west1.firebasedatabase.app/"
    };

    constructor() {
        initializeApp(this.firebaseConfig);
    }

    getRandomlySelectedItem(list) {
        const random = Math.floor(Math.random() * list.length);
        return list[random];
    }

    async getQuestionsForCurrentUser(numberOfQuestions) {
        const questions = await this.getQuestions();
        let keys = Object.keys(questions);
        const finalQuestions = {};
        for (let i = 0; i < numberOfQuestions; i++) {
            const elementKey = this.getRandomlySelectedItem(keys);
            finalQuestions[elementKey] = questions[elementKey];
            keys.splice(keys.indexOf(elementKey), 1);
        }

        return finalQuestions;
    }

    writeNewUser(userData) {
        const db = getDatabase();

        // Get a key for a new Post.
        const newPostKey = push(child(ref(db), 'users')).key;

        // Write the new post's data simultaneously in the posts list and the user's post list.
        const updates = {};
        updates['/users/' + newPostKey] = userData;

        return update(ref(db), updates);
    }

    getQuestions() {
        const dbRef = ref(getDatabase());
        return get(child(dbRef, `/questions`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    return snapshot.toJSON();
                } else {
                    throw new Error("Unable to get data from Firebase");
                }
            });
    }
}

export { FirebaseService };
