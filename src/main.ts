import "./style.css";

const scoreText = document.querySelector<HTMLButtonElement>("#score");
const timerText = document.querySelector<HTMLButtonElement>("#timer");
const allTimersUL = document.querySelector<HTMLUListElement>("#all-timers");
const bestTimeText = document.querySelector<HTMLButtonElement>("#best-time");

const userTime = 1706466222000;
const userAllTimers = "2040|30031|21331|313133451";

setScore();
setTimer();
setAllTimers();

function setScore() {
	const currentTime = new Date().getTime();

	console.log("Current time: " + currentTime);

	const timeBetween = currentTime - userTime;

	console.log("Time between: " + timeBetween);

	const yearsBetween = Math.floor(timeBetween / 31536000000);
	const daysBetween = Math.floor((timeBetween % 31536000000) / 86400000);
	const hoursBetween = Math.floor(
		((timeBetween % 31536000000) % 86400000) / 3600000
	);
	const minutesBetween = Math.floor(
		(((timeBetween % 31536000000) % 86400000) % 3600000) / 60000
	);
	const secondsBetween = Math.floor(
		((((timeBetween % 31536000000) % 86400000) % 3600000) % 60000) / 1000
	);

	const humanTimeBetween = `${yearsBetween} years, ${daysBetween} days, ${hoursBetween} hours, ${minutesBetween} minutes, ${secondsBetween} seconds`;

	scoreText!.innerHTML = humanTimeBetween;
}

function setTimer() {
	let timer = 0;

	setInterval(() => {
		const time = secondsToYearsDaysHoursMinutesSeconds(timer);
		timerText!.innerHTML = time;

		timer++;
	}, 1000);
}

function setAllTimers() {
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
