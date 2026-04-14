let docente=""
let curso=""
let alumno=""

let qr=null
let cursos={}
let registrosDuplicados=new Set()

/* CARGAR CURSOS DESDE GOOGLE SHEETS */

async function cargarCursos(){

const url="PEGA_AQUI_TU_URL_DE_GOOGLE_SCRIPT"

const res=await fetch(url)

cursos=await res.json()

mostrarCursos()

}

/* INICIO */

function iniciarSistema(){

docente=document.getElementById("docente").value.trim()

if(!docente){
alert("Ingrese nombre del docente")
return
}

document.getElementById("login").style.display="none"
document.getElementById("app").style.display="block"

document.getElementById("docenteNombre").innerText="Docente: "+docente

cargarCursos()

}

/* CURSOS */

function mostrarCursos(){

let html=""

for(let c in cursos){

html+=`<div class="lista" onclick="seleccionarCurso('${c}')">${c}</div>`

}

document.getElementById("cursos").innerHTML=html

}

/* CURSO */

function seleccionarCurso(c){

curso=c

mostrarAlumnos()

}

/* ALUMNOS */

function mostrarAlumnos(){

let lista=cursos[curso]

let html=""

lista.forEach(a=>{

html+=`<div class="lista alumno">${a}</div>`

})

document.getElementById("alumnos").innerHTML=html

document.querySelectorAll(".alumno").forEach(el=>{

el.onclick=()=>{

alumno=el.innerText

document.getElementById("resultado").innerText="Escanee equipo para "+alumno

iniciarEscaneo()

}

})

}

/* BUSCAR */

function filtrarAlumno(){

let filtro=document.getElementById("buscarAlumno").value.toLowerCase()

document.querySelectorAll(".alumno").forEach(el=>{

let nombre=el.innerText.toLowerCase()

el.style.display=nombre.includes(filtro)?"block":"none"

})

}

/* ESCANEO */

async function iniciarEscaneo(){

if(qr)return

qr=new Html5Qrcode("reader")

await qr.start(
{facingMode:"environment"},
{fps:10,qrbox:250},
onScan
)

}

/* SCAN */

function onScan(text){

if(registrosDuplicados.has(text)){

document.getElementById("resultado").innerText="⚠ Equipo ya registrado"

return

}

registrosDuplicados.add(text)

guardarRegistro(text)

document.getElementById("resultado").innerText=
`${alumno} registró equipo ${text}`

mostrarEstadisticas()

}

/* GUARDAR */

function guardarRegistro(equipo){

let registros=JSON.parse(localStorage.getItem("registros"))||[]

registros.push({

docente,
curso,
alumno,
equipo,
fecha:new Date().toLocaleString()

})

localStorage.setItem("registros",JSON.stringify(registros))

}

/* ESTADISTICAS */

function mostrarEstadisticas(){

let registros=JSON.parse(localStorage.getItem("registros"))||[]

let conteo={}

registros.forEach(r=>{

if(!conteo[r.curso])conteo[r.curso]=0

conteo[r.curso]++

})

let html=""

for(let c in conteo){

html+=`<div>${c}: ${conteo[c]} equipos registrados</div>`

}

document.getElementById("estadisticas").innerHTML=html

}

/* EXCEL */

function exportarExcel(){

let registros=JSON.parse(localStorage.getItem("registros"))||[]

let wb=XLSX.utils.book_new()

let cursosUnicos=[...new Set(registros.map(r=>r.curso))]

cursosUnicos.forEach(c=>{

let datos=registros
.filter(r=>r.curso===c)
.map(r=>({

Docente:r.docente,
Alumno:r.alumno,
Equipo:r.equipo,
Fecha:r.fecha

}))

let ws=XLSX.utils.json_to_sheet(datos)

XLSX.utils.book_append_sheet(wb,ws,c)

})

XLSX.writeFile(wb,"registro-equipos.xlsx")

}

window.onload=()=>{

mostrarEstadisticas()

}
