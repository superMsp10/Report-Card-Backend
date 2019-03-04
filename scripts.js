import * as fs from 'fs';
const dataPath = "data/";

const studentsPath = dataPath + "students.csv";
const coursesPath = dataPath + "courses.csv";
const testsPath = dataPath + "tests.csv";
const marksPath = dataPath + "marks.csv";
const outputPath = "output.txt";

let students = [];
let marks = [];
let courses = {};
let tests = {};
let studentToMarks = {};


function main() {
  parseByLine(studentsPath, parseStudents);
  parseByLine(coursesPath, parseCourses);
  parseByLine(testsPath, parseTests);
  parseByLine(marksPath, parseMarks);

  printReport();
}

function printReport() {
  let report = "";

  students.forEach(student => {
    const index = student[0];
    const name = student[1];
    let headLine = `Student Id: ${index}, name: ${name} \n`;
    let averageLine;
    let _marks = studentToMarks[index];
    let courseObjs = finalStudentMarksByCourse(_marks);
    let markSum = 0;
    let courseLines = "";
    let courseCount = 0;

    courseObjs.forEach(courseSummative => {
      courseCount++;
      markSum += courseSummative[2];
      courseLines += `\tCourse: ${courseSummative[0]}, Teacher: ${courseSummative[1]} \n`
      courseLines += `\tFinal Grade: ${courseSummative[2].toFixed(2)} %\n\n`
    });

    courseCount = courseCount == 0 ? 1 : courseCount;
    averageLine = "Total Average: " + (markSum / courseCount).toFixed(2) + "%\n\n"
    report += headLine + averageLine + courseLines + "\n\n\n";
  });

  fs.writeFile(outputPath, report, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was outputted!");
  });
}

function finalStudentMarksByCourse(_marks) {
  let courseObjs = [];

  _marks.forEach(markIndex => {
    let markObj = marks[markIndex];
    let mark = markObj[1] / 100;
    let testId = markObj[0];
    let testObj = tests[testId];
    let testWeight = testObj[1] / 100;
    let courseId = testObj[0];
    let courseObj = courses[courseId];
    let weightedMark = mark * testWeight * 100;

    if (courseObjs[courseId] == undefined) {
      //name, teacher, marksSum
      courseObjs[courseId] = [courseObj[0], courseObj[1], weightedMark];
    } else {
      courseObjs[courseId][2] += weightedMark;
    }
  });

  return courseObjs;
}

function parseByLine(path, callback) {
  let lines = fs.readFileSync(path, 'utf-8')
    .split('\n')
    .filter(Boolean);
  //Skip first line, its a description of each coloumn
  for (let index = 1; index < lines.length; index++) {
    callback(lines[index]);
  }
}

function parseStudents(line) {
  let values = line.split(",");
  //id,name
  students.push([values[0], values[1]]);
}

function parseCourses(line) {
  let values = line.split(",");
  //id,name,teacher
  courses[values[0]] = [values[1], values[2]];
}

function parseTests(line) {
  let values = line.split(",");
  //id,course_id,weight
  tests[values[0]] = [values[1], values[2]];
}

function parseMarks(line) {
  let values = line.split(",");
  //test_id,student_id,mark
  let index = marks.push([values[0], values[2]]) - 1;
  if (studentToMarks[values[1]] == undefined) {
    studentToMarks[values[1]] = [];
  }
  studentToMarks[values[1]].push(index);
}


main();