mainApp.controller('questionController', function($scope){

    questions = [
    {
        date: new Date(2016, 5, 14),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        status: 'attemptedCorrect',
    },
    {
        date: new Date(2016, 5, 15),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        status: 'attemptedCorrect',
    },
    {
        date: new Date(2016, 5, 16),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        status: 'attemptedIncorrect',
    },
    {
        date: new Date(2016, 5, 17),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        status: 'attemptedCorrect',
    },
    {
        date: new Date(2016, 5, 18),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        status: 'attemptedIncorrect',
    },
    {
        date: new Date(2016, 5, 19),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        status: 'attemptedIncorrect',
    },
    {
        date: new Date(2016, 5, 20),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        status: 'unattempted',
    },
    {
        date: new Date(2016, 5, 21),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        status: 'attemptedIncorrect',
    },
    {
        date: new Date(2016, 5, 22),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        status: 'attemptedCorrect',
    },
    {
        date: new Date(2016, 5, 23),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        status: 'attemptedCorrect',
    },
    {
        date: new Date(2016, 5, 24),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        status: 'attemptedCorrect',
    },
    {
        date: new Date(2016, 5, 25),
        title: "Which is an incorrect constructor?",
        concepts: "constructors",
        status: 'attemptedIncorrect',
    },
    {
        date: new Date(2016, 5, 26),
        title: "Which is an incorrect constructor?",
        concepts: "constructors",
        status: 'attemptedCorrect',
    },
    {
        date: new Date(2016, 5, 27),
        title: "Which is an incorrect constructor?",
        concepts: "constructors",
        status: 'attemptedCorrect',
    },
    {
        date: new Date(2016, 5, 28),
        title: "Which is an incorrect constructor?",
        concepts: "constructors",
        status: 'attemptedIncorrect',
    },
    {
        date: new Date(2016, 5, 29),
        title: "Select all proper array instantiations",
        concepts: "arrays",
        status: 'unattempted',
    },
    {
        date: new Date(2016, 5, 30),
        title: "Select all proper array instantiations",
        concepts: "arrays",
        status: 'unattempted',
    },
    {
        date: new Date(2016, 6, 1),
        title: "What is the output of the following code?",
        concepts: "methods, local variables",
        status: 'unattempted'
    }
    ];

    noquestion = {
        date: '',
        title: "-",
        concepts: "",
        status: 'No Question'
    };

    $scope.$watch('dt', function(){
        console.log("Date has changed to " + $scope.dt);
        var dayToCheck = new Date($scope.dt).setHours(0,0,0,0);

        for (var i = 0; i < questions.length; i++) {
            var currentDay = new Date(questions[i].date).setHours(0,0,0,0);

            if (dayToCheck === currentDay) {
                $scope.question = questions[i];
                console.log("Date with Question Found");

                switch($scope.question.status){
                    case 'attemptedCorrect':
                        $scope.prettyStatus = "Attempted Correctly";
                        break;
                    case 'attemptedIncorrect':
                        $scope.prettyStatus = "Attempted Incorrectly";
                        break;
                    case 'unattempted':
                        $scope.prettyStatus = "Not Yet Attempted";
                        break;
                    default:
                        $scope.prettyStatus = "Status Not Found";
                }

                return true;
            }
        }
        $scope.question = noquestion;
        $scope.prettyStatus = $scope.question.status;
        console.log("Date has No Question");
    });

    // TODO: Route to Question View with question data
    $scope.goToQuestion = function(){
        console.log("Data to be Sent: ");
        console.log($scope.question);
    };

    // Set Today, Options, and Custom Classes
    $scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.options = {
        customClass: getDayClass,
        maxDate: new Date(),
        showWeeks: false
    };

    function getDayClass(data) {
        var date = data.date,
        mode = data.mode;
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0,0,0,0);

            for (var i = 0; i < questions.length; i++) {
                var currentDay = new Date(questions[i].date).setHours(0,0,0,0);

                if (dayToCheck === currentDay) {
                    return questions[i].status;
                }
            }
        }

        return '';
    } 
});

