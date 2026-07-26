function addStudent(){

let name=document.getElementById("name").value;

let m1=parseInt(document.getElementById("m1").value);

let m2=parseInt(document.getElementById("m2").value);

let m3=parseInt(document.getElementById("m3").value);

let total=m1+m2+m3;

let avg=total/3;

let grade;

if(avg>=90)
grade="A+";

else if(avg>=80)
grade="A";

else if(avg>=70)
grade="B";

else if(avg>=60)
grade="C";

else if(avg>=50)
grade="D";

else
grade="Fail";

let row="<tr>";

row+="<td>"+name+"</td>";

row+="<td>"+total+"</td>";

row+="<td>"+avg.toFixed(2)+"</td>";

row+="<td>"+grade+"</td>";

row+="</tr>";

document.getElementById("resultTable").innerHTML+=row;

document.getElementById("name").value="";
document.getElementById("m1").value="";
document.getElementById("m2").value="";
document.getElementById("m3").value="";
}