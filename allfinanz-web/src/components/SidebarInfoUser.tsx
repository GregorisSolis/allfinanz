import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../services/api";
import { LineChart } from "./LineChart";

interface SidebarInfoUserProps {
  listCostFixed: never[];
  listCostMonth: never[];
}

export function SidebarInfoUser(props: SidebarInfoUserProps) {
  useEffect(() => {
    loadDataUser();
  });

  const ID_USER = localStorage.getItem("iden");
  const navigate = useNavigate();
  let [monthlyIconme, setMonthlyIconme] = useState(0);
  let [percentageMonthlyIconme, setPercentageMonthlyIconme] = useState(0);
  let [percentageCostMonth, setPercentageCostMonth] = useState(0);
  let [percentageCostFixed, setPercentageCostFixed] = useState(0);
  let [percentageTotalCost, setPercentageTotalCost] = useState(0);
  let [costFixed, setCostFixed] = useState(0);
  let [costMonth, setCostMonth] = useState(0);
  let [totalCost, setTotalCost] = useState(0);
  let [missing, setMissing] = useState(0);
	let [isLoading, setIsLoading] = useState('')

  if (missing < 0) {
    missing = 0;
  }

  function loadDataUser() {
		setIsLoading('blur-sm animate-pulse transition');
    API.get(`/auth/info-user/${ID_USER}`)
      .then((resp) => {
        setMonthlyIconme(
          parseFloat(resp.data.user.monthlyIconme.$numberDecimal)
        );
        operationTransactionTotal();
      })
      .catch((err) => {
        navigate("/login");
      });
		setIsLoading('');
  }

  function operationTransactionTotal() {
    let value = 0;
    props.listCostFixed.map((item: any) => {
      value += parseFloat(item.value.$numberDecimal);
    });
    setCostFixed(parseFloat(value.toFixed(2)));

    value = 0;
    props.listCostMonth.map((item: any) => {
      value += parseFloat(item.value.$numberDecimal);
    });
    setCostMonth(parseFloat(value.toFixed(2)));

    setTotalCost(parseFloat((costFixed + costMonth).toFixed(2)));
    setMissing(parseFloat((totalCost - monthlyIconme).toFixed(2)));

    operationPercentage();
  }

  function operationPercentage() {
    let percentageMonthlyIconme = (totalCost / monthlyIconme) * 100;
    setPercentageMonthlyIconme(percentageMonthlyIconme);


    if (percentageMonthlyIconme > 100) {
      setPercentageMonthlyIconme(100);
    } else {
      setPercentageMonthlyIconme(percentageMonthlyIconme);
    }


    let percentageCostMonth = (costMonth / monthlyIconme) * 100;
    if (percentageCostMonth > 100) {
      setPercentageCostMonth(100);
    } else {
      setPercentageCostMonth(percentageCostMonth);
    }


    let percentageCostFixed = (costFixed / monthlyIconme) * 100;
    if (percentageCostFixed > 100) {
      setPercentageCostFixed(100);
    } else {
      setPercentageCostFixed(percentageCostFixed);
    }


    let percentageTotalCost = (totalCost / monthlyIconme) * 100;
    if (percentageTotalCost > 100) {
      setPercentageTotalCost(100);
    } else {
      setPercentageTotalCost(percentageTotalCost);
    }
  }

  return (
    <div className={"bg-brand-200 lg:w-[30%] md:w-[90%] h-[30%] my-4 rounded shadow-lg py-4 px-8 " + isLoading}>
      <h1 className="text-center w-full text-white text-xl">Detalles</h1>

      <LineChart
        title="Renda mensual"
        dataValue={monthlyIconme}
        bg_color="bg-emerald-500 shadow-emerald-500"
        percentage={percentageMonthlyIconme}
      />

      <LineChart
        title="Gastos fijos"
        dataValue={costFixed}
        bg_color="bg-teal-500 shadow-teal-500"
        percentage={percentageCostFixed}
      />

      <LineChart
        title="Gastos del mes"
        dataValue={costMonth}
        bg_color="bg-purple-700 shadow-purple-700"
        percentage={percentageCostMonth}
      />

      <LineChart
        title="Gastos total"
        dataValue={totalCost}
        bg_color="bg-orange-500 shadow-orange-500"
        percentage={percentageTotalCost}
      />
    </div>
  );
}
