import { useState } from "react";

export default function App() {

const [month,setMonth] = useState(new Date());

const days = new Date(
month.getFullYear(),
month.getMonth()+1,
0
).getDate();

function nextMonth(){
setMonth(new Date(month.getFullYear(),month.getMonth()+1,1));
}

function prevMonth(){
setMonth(new Date(month.getFullYear(),month.getMonth()-1,1));
}

function goToday(){
setMonth(new Date());
}

const [selectedDay,setSelectedDay] = useState(null);

return (

<div style={{padding:"20px",fontFamily:"Arial"}}>

<h1 style={{textAlign:"center"}}>
Calendario Corporativo
</h1>

<div style={{
display:"flex",
justifyContent:"center",
gap:"10px",
marginBottom:"20px"
}}>

<button onClick={prevMonth}>◀</button>

<h2>
{month.toLocaleString('es',{month:'long'})}
{" "}
{month.getFullYear()}
</h2>

<button onClick={nextMonth}>▶</button>

<button onClick={goToday}>
Hoy
</button>

</div>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(7,1fr)",
gap:"10px"
}}>

{Array.from({length:days},(_,i)=>{

const day=i+1;

return(

<div
key={day}
onClick={()=>setSelectedDay(day)}
style={{
border:"1px solid #ccc",
minHeight:"90px",
padding:"5px",
cursor:"pointer"
}}
>

<strong>{day}</strong>

</div>

)

})}

</div>

<div style={{marginTop:"40px"}}>

<h3>
Detalles del día {selectedDay ?? "-"}
</h3>

<p>
Aquí aparecerán eventos, comentarios y colores.
</p>

</div>

</div>

);

}
