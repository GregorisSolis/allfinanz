import React, { PureComponent, useEffect, useState } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import { API } from '../services/api'

interface GraficsProps {
  listData: never[]
}


export function Grafics(props: GraficsProps) {

    useEffect(() => {
      loadCardUser()
    }, [])

    let dataFilter:any = [];
    const ID_USER = localStorage.getItem('iden')
    const [cards, setCards] = useState([])
    const [colors, setColors] = useState([])

    props.listData.map((transation: any) => {
        if(dataFilter.length > 0){
          dataFilter.map((item: any) => {
            if(item.name === transation.card){
              item.value += parseFloat(transation.value.$numberDecimal);
            }else{
              dataFilter.push({name: transation.card,value: parseFloat(transation.value.$numberDecimal)});
            }
            //Aqui vas a colocar si el nombre del carton ya existe, vas a sumar el valor
          })
        }else{
          dataFilter.push({name: transation.card,value: parseFloat(transation.value.$numberDecimal)});
        }
    })

    async function loadCardUser() {
      await API.get(`/card/all-card/user/${ID_USER}`)
        .then(resp => {
          setCards(resp.data.card)
        })
        getColorCard();
    }

    function getColorCard(){
      let colorsFilter:any = [];
      cards.map((card: any) => {
        dataFilter.map((item: any) => {
          if(item.name === card.name){
              if(!colorsFilter.includes(card.color)){
                colorsFilter.push(card.color);
              }
          }
        })
      })
      setColors(colorsFilter);
    }
  
    return (
      <PieChart width={800} height={400} >
        <Pie
          data={dataFilter}
          cx={120}
          cy={200}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {dataFilter.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    );
}
