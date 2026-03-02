import { useState } from "react";

export default function App() {

const [currentDate,setCurrentDate] = useState(new Date());
const [selectedDay,setSelectedDay] = useState(null);

const year = currentDate.getFullYear();
const month = currentDate.getMonth();

const daysInMonth = new Date(year, month + 1, 0).getDate();

function nextMonth(){
setCurrentDate(new Date(year, month + 1, 1));
}

function prevMonth(){
setCurrentDate(new Date(year, month - 1, 1));
}

function goToday(){
setCurrentDate(new Date());
}

return (

<div style={{padding:"30px",fontFamily:"Arial"}}>

{/* HEADER */}

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"20px"
}}>

<h1>
{currentDate.toLocaleString("es", { month: "long" })}
{" "}
{year}
</h1>

<div style={{display:"flex",gap:"10px"}}>

<button onClick={prevMonth}>◀</button>

<button onClick={goToday}>Hoy</button>

<button onClick={nextMonth}>▶</button>

</div>

</div>

{/* CALENDARIO */}

<div style={{
display:"grid",
gridTemplateColumns:"repeat(7,1fr)",
gap:"12px"
}}>

{Array.from({length:daysInMonth},(_,i)=>{

const day = i+1;

return(

<div
key={day}
onClick={()=>setSelectedDay(day)}
style={{
border:"1px solid #ddd",
borderRadius:"8px",
minHeight:"90px",
padding:"8px",
cursor:"pointer",
background:selectedDay===day ? "#dbeafe":"white"
}}
>

<strong>{day}</strong>

</div>

)

})}

</div>

{/* PANEL INFERIOR */}

<div style={{
marginTop:"40px",
padding:"20px",
background:"#f5f5f5",
borderRadius:"10px"
}}>

<h2>Día {selectedDay ?? "-"}</h2>

<p>
Aquí aparecerán los eventos, reuniones o workshops.
</p>

</div>

</div>

);

}
