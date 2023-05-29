interface LineChartProps {
    dataValue: number,
    bg_color: string,
    title: string,
    percentage: number
}

export function LineChart(props: LineChartProps) {

    let percentage = Math.trunc(props.dataValue);

    return (
        <div className="w-full my-8">
            <div className="title flex items-center justify-between mb-2">
                <small className="text-white-200 text-sm">{props.title}</small>
                <small className="text-white-200 text-sm">$ {props.dataValue}</small>
            </div>
            <div className="line-grafic flex items-center relative w-full">
                <div className="bg-moon-500 w-full h-1 rounded absolute"></div>
                <div className={props.bg_color + " shadow-2xl shadow-white w-["+90+"%] transition h-1.5 rounded absolute"}></div>
            </div>
        </div>
    )
}