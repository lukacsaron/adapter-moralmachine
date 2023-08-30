let currentQuestionIndex = 0;
let sessionID = '';
let questions = [];


// Initiate a new session and load the first question
async function initiateSession() {
    try {
        const response = await fetch('/new-session');
        const data = await response.json();
        sessionID = data.sessionID;
        loadQuestion(currentQuestionIndex);
    } catch (err) {
        console.error('Error initiating session:', err);
    }
    const response = await fetch('/questions-data');
    if (response.status !== 200) {
        console.error("Error fetching questions:", await response.text());
        return;
    }
    questions = await response.json(); // Set the global questions variable

}

// Load a question based on its index
async function loadQuestion(index) {
    try {
        const response = await fetch(`/questions/${index}`);
        const data = await response.json();
        const questionElement = document.getElementById('question');
        const yesButtonElement = document.getElementById('yesButton');
        const noButtonElement = document.getElementById('noButton');

        questionElement.textContent = data.question;
        yesButtonElement.textContent = data.choices.yes;
        noButtonElement.textContent = data.choices.no;
    } catch (err) {
        console.error('Error loading question:', err);
    }
}

// Submit an answer for the current question
// Submit an answer for the current question
// Submit an answer for the current question
async function submitAnswer(choice) {
    try {
        const response = await fetch(`/answers/${sessionID}/${currentQuestionIndex}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answer: choice })
        });

        const data = await response.json();
        const feedbackContentElement = document.getElementById('typedContent');
        const cursorElement = document.getElementById('cursor');
        
        // Format the feedback with potential styling
        const formattedFeedback = renderFeedback(data.feedback);
        
        // Clear the typed content, show the cursor, and initiate typing effect
        feedbackContentElement.innerHTML = '';
        cursorElement.style.display = 'inline'; // Show the cursor
        clearTimeout(typeTimeout); // Ensure no typing is ongoing
        typeText(feedbackContentElement, formattedFeedback);

        document.getElementById('yesButton').style.display = 'none';
        document.getElementById('noButton').style.display = 'none';
        document.getElementById('nextButton').style.display = 'inline-block';
    } catch (err) {
        console.error('Error submitting answer:', err);
    }
}




function renderFeedback(feedbackText) {
    feedbackText = feedbackText.replace(/\[\[bold\]\]/g, "<span class='bold'>");
    feedbackText = feedbackText.replace(/\[\[\/bold\]\]/g, "</span>");

    feedbackText = feedbackText.replace(/\[\[italic\]\]/g, "<span class='italic'>");
    feedbackText = feedbackText.replace(/\[\[\/italic\]\]/g, "</span>");

    feedbackText = feedbackText.replace(/\[\[br\]\]/g, "<br>");
    // Add more replacements if you have other styles
    return feedbackText;
}


// Proceed to the next question
function proceedToNextQuestion() {
    // Stop any ongoing typing effect
    clearTimeout(typeTimeout);

    currentQuestionIndex++;

    // If there's a next question
    if (currentQuestionIndex < 4) { 
        loadQuestion(currentQuestionIndex);
        document.getElementById('yesButton').style.display = 'inline-block';
        document.getElementById('noButton').style.display = 'inline-block';
        document.getElementById('nextButton').style.display = 'none';
        document.getElementById('typedContent').textContent = '';
        document.getElementById('cursor').style.display = 'none';


        // If the upcoming question is the last one, change the next button's text
        if (currentQuestionIndex === 3) { // 3 is the index of the last question (0-based index)
            document.getElementById('nextButton').textContent = "Mutasd az összesítést!";
        } else {
            document.getElementById('nextButton').textContent = "Tovább"; // Reset to "Next" for other questions
        }

    } else {
        endSession();
    }
}


// End the session and show the summary
// End the session, fetch user's answers, and show the summary
async function endSession() {
    // Saving answers to the backend
    const response = await fetch(`/end-session/${sessionID}`);
    if (response.status !== 200) {
        console.error('Error ending session:', await response.text());
        return;
    }

    // Fetching summary data
    const summaryResponse = await fetch('/summary');
    if (summaryResponse.status !== 200) {
        console.error('Error fetching summary:', await summaryResponse.text());
        return;
    }
    const summaryData = await summaryResponse.json();

    // Fetching user's answers
    const userAnswersResponse = await fetch(`/answers/${sessionID}`);
    if (userAnswersResponse.status !== 200) {
        console.error('Error fetching user answers:', await userAnswersResponse.text());
        return;
    }
    const userAnswersData = await userAnswersResponse.json();

    // Processing the data to display in the summary container
    let summaryHTML = "";
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i].question;
        const userAnswerObj = userAnswersData.find(ans => ans.question_id === i);
        const userAnswer = userAnswerObj ? userAnswerObj.answer : "Not Answered";
        const yesPercentage = summaryData.percentages[i] ? summaryData.percentages[i].yes.toFixed(2) : 0;  // converting to 2 decimal places
        const noPercentage = summaryData.percentages[i] ? summaryData.percentages[i].no.toFixed(2) : 0;    // converting to 2 decimal places

        const userAnswerText = userAnswer === "yes" ? "Igen" : (userAnswer === "no" ? "Nem" : "Nem válaszoltál");

        summaryHTML += `
        <div class="summary-item">
            <h4>${question}</h4>
            <div>A te válaszod erre a kérdésre:<span class="bold"> ${userAnswerText}</span></div>
            <div class="italic">A korábbi felhasználók ilyen arányban válaszoltak:</div>
            
            <div class="bar-container">
                <div class="bar" style="width:0%" data-value="${yesPercentage}">
                    <span class="bar-label">Igen: ${yesPercentage}%</span>
                </div>
            </div>
            <div class="bar-container">
                <div class="bar" style="width:0%" data-value="${noPercentage}">
                    <span class="bar-label">Nem: ${noPercentage}%</span>
                </div>
            </div>
        </div>
    `;
    }

    document.getElementById('summaryContainer').innerHTML = summaryHTML;

    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
        const value = bar.getAttribute('data-value');
        requestAnimationFrame(() => { 
            bar.style.width = `${value}%`;
        });
    });
    


    // Switch views
    document.getElementById('question').style.display = 'none';
    document.getElementById('yesButton').style.display = 'none';
    document.getElementById('noButton').style.display = 'none';
    document.getElementById('feedback').style.display = 'none';
    document.getElementById('nextButton').style.display = 'none';
    document.getElementById('summaryContainer').style.display = 'block';
    document.getElementById('reloadButton').style.display = 'inline-block';
}

let typeTimeout;

function typeText(element, text, index = 0) {
    clearTimeout(typeTimeout);

    if (index < text.length) {
        const isTag = text.charAt(index) === '<';
        const tagCloseIndex = isTag ? text.indexOf('>', index) : -1;

        if (isTag && tagCloseIndex !== -1) {
            element.innerHTML += text.substring(index, tagCloseIndex + 1);
            index = tagCloseIndex + 1;
        } else {
            element.innerHTML += text.charAt(index);
            index++;
            scrollCursorIntoView()
        }

        // Calculate a dynamic delay
        const delay = computeTypingDelay(text.charAt(index));

        typeTimeout = setTimeout(() => typeText(element, text, index), delay);
    }
    if (index >= text.length) {
        document.getElementById('cursor').style.display = 'none';
        document.getElementById('cursor').style.display = 'none';
        document.getElementById('nextButton').classList.remove('btn-inactive');  // Remove inactive state
        document.getElementById('nextButton').classList.add('btn-grow-effect'); // Add grow effect
        // Remove the grow effect class after animation is done to ensure it can be re-added later
        setTimeout(() => {
            document.getElementById('nextButton').classList.remove('btn-grow-effect');
        }, 500);  // 500ms is the duration of the animation as set in CSS
    }
}

function scrollCursorIntoView() {
    const cursor = document.getElementById('cursor');

    // Use scrollIntoView to ensure the cursor is visible
    cursor.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
}

// You might want to call this function whenever text changes
// For instance, if you're using a library like Typed.js or a custom function to handle the typing animation:
// (Assuming you're using some library or method called 'typeText')
// typeText(yourText, {
//   onType: () => {
//     scrollCursorIntoView();
//   }
// });


function computeTypingDelay(char) {
    const commonPauses = ['.', ',', '!', '?', ';'];
    const shortPauses = [' ', '-', ':'];

    if (commonPauses.includes(char)) {
        return 125 + Math.random() * 75;  // Pause for longer at end of sentences
    } else if (shortPauses.includes(char)) {
        return 20 + Math.random() * 50;  // Slightly longer pause at spaces or short punctuation
    }
    return 5 + Math.random() * 25;  // Varying typing speed for regular characters
}

let timeout;

function startOrResetTimer() {
    clearTimeout(timeout);  // Reset the timer if it's already running

    timeout = setTimeout(() => {
        location.reload();  // Reload the page after 20 seconds
    }, 50000);  
}

let interactionTimeoutDuration = 10000; // 10 seconds
let timerTimeout;
let interactionTimeout;

document.addEventListener('scroll', handleInteraction);
document.addEventListener('touchstart', handleInteraction);
document.addEventListener('click', handleInteraction);

function handleInteraction() {
    // Clear previous timeouts
    clearTimeout(interactionTimeout);
    clearTimeout(timerTimeout);
    
    // Reset the timer line's width
    const timerLine = document.getElementById('timerLine');
    timerLine.style.transition = 'none'; // Temporarily disable transitions
    timerLine.style.width = '0%';

    // Reflow to ensure the transition restarts
    void timerLine.offsetWidth; // This forces a reflow

    timerLine.style.transition = 'width 100s linear'; // Re-enable the transition
    timerLine.style.width = '100%'; // Start the transition

    // Set up the interaction timeout (10 seconds)
    interactionTimeout = setTimeout(() => {
        location.reload();
    }, interactionTimeoutDuration + 900000); // This accounts for the 10-second interaction timeout plus the 20-second timer.
}

function startTimer() {
    const timerLine = document.getElementById('timerLine');
    timerLine.style.transition = 'width 100s linear';
    timerLine.style.width = '100%';
    
    // Set the timeout to check for interactions
    timerTimeout = setTimeout(() => {
        location.reload();
    }, 100000); // This waits 20 seconds, then checks if there was any interaction. If not, it reloads the page.
}

// Start the timer when the script loads
startTimer();


document.addEventListener('mousemove', startOrResetTimer);
document.addEventListener('mousemove', handleInteraction);
document.addEventListener('mousedown', startOrResetTimer);  // mouse clicks
document.addEventListener('keypress', startOrResetTimer);  // key presses
document.addEventListener('touchmove', startOrResetTimer);  // touch movement
window.addEventListener('scroll', startOrResetTimer);  // scrolling


function stopAllTimers() {
    clearTimeout(typeTimeout);
    clearTimeout(timeout);
    clearTimeout(timerTimeout);
    clearTimeout(interactionTimeout);
    
    // Additionally, if you want to reset the visual timer line
    const timerLine = document.getElementById('timerLine');
    timerLine.style.transition = 'none';
    timerLine.style.width = '0%';
}

document.getElementById("start").addEventListener("click", function() {
    const intro = document.getElementById("intro");
    intro.classList.add("slide-out");

    
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function() {
        console.log('Service Worker Registered');
    });
}




initiateSession(); // Automatically start a session when the page loads
startOrResetTimer();

