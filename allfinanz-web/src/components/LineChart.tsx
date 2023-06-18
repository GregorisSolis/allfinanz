interface LineChartProps {
    dataValue: number,
    bg_color: string,
    title: string,
    percentage: number
}

export function LineChart(props: LineChartProps) {

    let percentage = Math.trunc(props.percentage) || 0;

    return (
        <div className="w-full my-8">
            <div className="title flex items-center justify-between mb-2">
                <small className="text-white-200 text-sm">{props.title}</small>
                <small className="text-white-200 text-xs">{percentage}%</small>
                <small className="text-white-200 text-sm">$ {props.dataValue.toFixed(2)}</small>
            </div>
            <div className="line-grafic flex items-center relative w-full">
                <div className="bg-moon-500 w-full h-1 rounded absolute"></div>
                <div style={{ width: percentage+'%' }} className={props.bg_color + " transition h-1.5 rounded absolute shadow loading_line"}></div>
            </div>
        </div>
    )
}