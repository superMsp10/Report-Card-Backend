const fs = require('fs');
const dataPath = "data/";

const studentsPath = dataPath + "students.csv";
const coursesPath = dataPath + "courses.csv";
const testsPath = dataPath + "tests.csv";
const marksPath = dataPath + "marks.csv";
const outputPath = "output.txt";

var students = [];
var courses = [];
var tests = [];
var marks = [];
var studentToMarks = [];


function main(){
  parseByLine(studentsPath, parseStudents);
  parseByLine(coursesPath, parseCourses);
  parseByLine(testsPath, parseTests);
  parseByLine(marksPath, parseMarks);

  printReport();
}

function printReport(){
  var report = "";
  for (let index = 1; index < students.length; index++) {
    var headLine;
    var averageLine;
    headLine = "Student Id: "+ index +", name: " + students[index] + "\n";
    var _marks = studentToMarks[index];

    var courseObjs = finalStudentMarksByCourse(_marks);
    var markSum = 0;
    var courseLines = "";
    courseObjs.forEach(courseSummative => {

      markSum += courseSummative[2];
      courseLines += "\tCourse: "+ courseSummative[0] + ", Teacher: " + courseSummative[1] + "\n"
      courseLines += "\tFinal Grade: " + courseSummative[2].toFixed(2) +"%\n\n"
    });
    
   averageLine = "Total Average: "+ (markSum/(courseObjs.length-1)).toFixed(2) +"%\n\n"
   report += headLine + averageLine + courseLines + "\n\n\n";
  }
  
  fs.writeFile(outputPath, report, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was outputted!");
}); 
}

function finalStudentMarksByCourse(_marks){
  var courseObjs = [];

  _marks.forEach(markIndex => {
    var markObj = marks[markIndex];

    var mark = markObj[1]/100;

    var testId = markObj[0];
    var testObj = tests[testId];
    var testWeight = testObj[1]/100;

    var courseId = testObj[0];
    var courseObj = courses[courseId];
    var weightedMark = mark * testWeight * 100;

    if(courseObjs[courseId] == undefined){
      //name, teacher, marksSum
      courseObjs[courseId] = [courseObj[0], courseObj[1], weightedMark];
    }else{
      courseObjs[courseId][2] += weightedMark;
    }
  });

  return courseObjs;
}

function parseByLine(path, callback){
  var lines = fs.readFileSync(path, 'utf-8')
  .split('\n')
  .filter(Boolean);
  //Skip first line, its a description of each coloumn
  for (let index = 1; index < lines.length; index++) {
    callback(lines[index]);
  }
}

function parseStudents(line){
  var values = line.split(",");
  //id,name
  students[values[0]] = values[1];
}

function parseCourses(line){
  var values = line.split(",");
  //id,name,teacher
  courses[values[0]] = [values[1], values[2]];
}

function parseTests(line){
  var values = line.split(",");
  //id,course_id,weight
  tests[values[0]] = [values[1], values[2]];
}

function parseMarks(line){
  var values = line.split(",");
  //test_id,student_id,mark
  var index = marks.push([values[0], values[2]]) - 1;
  if( studentToMarks[values[1]] == undefined){
    studentToMarks[values[1]] = [];
  }
  studentToMarks[values[1]].push(index);
 
}


main();