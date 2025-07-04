document.addEventListener("DOMContentLoaded", function(){

    console.log("DOM fully loaded");

    const searchButton = document.getElementById("search-button")
    const userInputName = document.getElementById("user-input")

    const statsContainer = document.querySelector(".stat-container")

    const easyProgress = document.querySelector(".easy-progress")
    const mediumProgress = document.querySelector(".medium-progress")
    const hardProgress = document.querySelector(".hard-progress")

    const easyLabel = document.getElementById("easy-label")
    const mediumLabel = document.getElementById("medium-label")
    const hardLabel = document.getElementById("hard-label")

    const cardstatscontainer = document.querySelector(".stat-cards")


    // return ture or false based on regular expression
    function validateusername(username){
        if(username.trim() === ""){
            alert("Username should not be empty")
            return false;
        }

        const regex = /^[a-zA-Z][a-zA-Z0-9_-]{3,14}$/;
        const isValidate = regex.test(username)
        if(isValidate == false){
            alert("Invalid Username")
        }
        return isValidate;
    }

    async function fetchUserDetails(username) {

        try{
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;
            

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/' 
            const targetUrl = 'https://leetcode.com/graphql/';
            

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");


            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { "username": `${username}` }
            })

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl+targetUrl, requestOptions);
            if(!response.ok) {
                throw new Error("Unable to fetch the User details");
            }

            const parsedData = await response.json();
            console.log("Logging data: ", parsedData) ;

            displayUserData(parsedData);
        }
        catch(error) {
            statsContainer.innerHTML = `<p>${error.message}</p>`
        }
        finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }


    function updateProgress(solved, total, label, circle){

        const progressDegree = (solved/total)*100;


        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }


    function displayUserData(parsedData){

        // Total No. of question
        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;

        //Solved question
        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;


        updateProgress(solvedEasyQues, totalEasyQues, easyLabel, easyProgress);
        updateProgress(solvedMediumQues, totalMediumQues, mediumLabel, mediumProgress);
        updateProgress(solvedHardQues, totalHardQues, hardLabel, hardProgress);


        const cardsData = [
            {
                label: "Overall Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions
            },
            {
                label: "Overall Easy Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions
            },
            {
                label: "Overall Medium Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions
            },
            {
                label: "Overall Hard Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions
            }
        ];

        cardstatscontainer.innerHTML = cardsData.map(
            data =>{
                return `
                    <div class="card">
                    <h4> ${data.label} </h4>
                    <p> ${data.value} </p>
                    </div>
                `
            }
        ).join("");


    }


    searchButton.addEventListener("click", function(){

        const username = userInputName.value;
        
        if(validateusername(username)){
            fetchUserDetails(username);
        }

    })

})