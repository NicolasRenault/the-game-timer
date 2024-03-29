import "./style.css";

import { initializeApp } from "firebase/app";
import {
	getAuth,
	GoogleAuthProvider,
	signInWithPopup,
	signOut,
	User,
} from "firebase/auth";
import { get } from "firebase/database";
import {
	getFirestore,
	collection,
	addDoc,
	setDoc,
	doc,
	getDoc,
	query,
	where,
	getDocs,
	orderBy,
} from "firebase/firestore";

interface UserData {
	timer: number;
	allTimers: string;
}

const firebaseConfig = {
	apiKey: "AIzaSyBg69FcbJUuczrlUtjT09gQRujerXkIXvc",
	authDomain: "the-game-timer.firebaseapp.com",
	projectId: "the-game-timer",
	storageBucket: "the-game-timer.appspot.com",
	messagingSenderId: "528262355745",
	appId: "1:528262355745:web:873bb3fc78b0e235f9fc60",
};

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const db = getFirestore(firebase);
const provider = new GoogleAuthProvider();

const signInBtn = document.getElementById("sign-in-btn");
const signOutBtn = document.getElementById("sign-out-btn");

signInBtn!.onclick = () =>
	signInWithPopup(auth, provider).catch((error) => console.error(error));
signOutBtn!.onclick = () => {
	signOut(auth);
	location.reload();
}; //! Warning change if the reaload take too much ressources instead of using logoutUser()

const appDiv = document.getElementById("app");
const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const allTimersUL = document.getElementById("all-timers");
const bestTimeText = document.getElementById("best-time");

let user: User;
let unsubscribe: () => any;

auth.onAuthStateChanged((user) => {
	if (user) {
		loginUser(user);
	} else {
		unsubscribe && unsubscribe();
	}
});

/**
 * Init the user informations
 *
 * @param {User} loggedUser
 */
async function loginUser(loggedUser: User) {
	user = loggedUser;
	console.log(user);

	appDiv?.classList.add("signed-in");

	const userData = await getUserData();

	//TODO mettre le timer dans allTimers
	//TODO updateUserData(userData);

	setScore(userData.timer);
	setTimer();
	setAllTimers(userData.allTimers);
}

/**
 * Get the user data from the firestore using the user id
 *
 * @returns
 */
function getUserData(): Promise<UserData> {
	const userDataDoc = doc(db, "timer", user.uid);
	const userData = getDoc(userDataDoc);

	let userTimers;

	return new Promise((resolve, _reject) => {
		userData.then((data) => {
			userTimers = data.data();
			if (!userTimers) {
				userTimers = {
					timer: 0,
					allTimers: "",
				};
			}
			resolve(userTimers as UserData);
		});
	});
}

/**
 * Update the user data in the firestore
 *
 * @param userData
 */
function updateUserData(userData: UserData) {
	// const userDataDoc = doc(db, "timer", user.uid);
	// setDoc(userDataDoc, userData);
	//TODO
}

/**
 * Display the last user
 *
 * @param userTime
 * @returns
 */
function setScore(userTime: number) {
	if (!userTime) return;
	console.log(userTime);
	const currentTime = new Date().getTime();

	console.log("Current time: " + currentTime);

	const timeBetween = currentTime - userTime;

	console.log("Time between: " + timeBetween);

	const humanTimeBetween = secondsToYearsDaysHoursMinutesSeconds(
		Math.floor(timeBetween / 1000),
		true
	);
	console.log(humanTimeBetween);
	scoreText!.innerHTML = humanTimeBetween;
}

/**
 * Set a timer and update it every second
 */
function setTimer() {
	let timer = 0;
	timerText!.innerHTML = secondsToYearsDaysHoursMinutesSeconds(timer);

	setInterval(() => {
		const time = secondsToYearsDaysHoursMinutesSeconds(timer);
		timerText!.innerHTML = time;

		timer++;
	}, 1000);
}

/**
 * Display all the previous user times and the best time.
 *
 * @param userAllTimers
 * @returns
 */
function setAllTimers(userAllTimers: string) {
	if (!userAllTimers) return;
	const allTimers = userAllTimers.split("|");
	let best = 0;

	allTimers.forEach((timer) => {
		const li = document.createElement("li");
		li.innerHTML = secondsToYearsDaysHoursMinutesSeconds(
			parseInt(timer),
			true
		);
		allTimersUL!.appendChild(li);

		if (parseInt(timer) > best) best = parseInt(timer);
	});

	if (best !== 0)
		bestTimeText!.innerHTML = secondsToYearsDaysHoursMinutesSeconds(
			best,
			true
		);
}

/**
 * Convert seconds to years, days, hours, minutes and seconds
 *
 * @param {number} time
 * @param {boolean} [verbose=false] If true, the function will return the time in a verbose way (e.g. 1 year, 2 days, 3 hours, 4 minutes, 5 seconds). Else it will return the time in a short way (e.g. 1 years, 2days, 03:04:05)
 * @returns
 */
function secondsToYearsDaysHoursMinutesSeconds(time: number, verbose = false) {
	const years = Math.floor(time / 31536000);
	const days = Math.floor((time % 31536000) / 86400);
	const hours = Math.floor(((time % 31536000) % 86400) / 3600);
	const minutes = Math.floor((((time % 31536000) % 86400) % 3600) / 60);
	const seconds = Math.floor(((((time % 31536000) % 86400) % 3600) % 60) / 1);

	let yearsString = years.toString() + " years, ";
	if (years == 0) yearsString = "";

	let daysString = days.toString() + " days, ";
	if (days == 0) daysString = "";

	let hoursString = hours.toString();
	if (hours < 10) hoursString = "0" + hours.toString();

	let minutesString = minutes.toString();
	if (minutes < 10) minutesString = "0" + minutes.toString();

	let secondsString = seconds.toString();
	if (seconds < 10) secondsString = "0" + seconds.toString();

	if (verbose) {
		hoursString += " hours, ";
		minutesString += " minutes, ";
		secondsString += " seconds";
	} else {
		hoursString += ":";
		minutesString += ":";
	}

	return `${yearsString}${daysString}${hoursString}${minutesString}${secondsString}`;
}
