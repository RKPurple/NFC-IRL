type GoalCardSlopProps = {
    day: string;
    target_value: number;
    total_logged: number;
    percent: number;
    met: boolean;
};

function GoalCardSlop({ day, target_value, total_logged, percent, met }: GoalCardSlopProps) {
    return (
        <div
            title={`${day}: ${total_logged}/${target_value} (${percent}%)`}
            className="flex h-10 w-10 items-center justify-center rounded-md text-xs font-medium text-white"
            style={{ backgroundColor: `hsl(120, ${percent}%, 40%)` }}
        >
            {met ? "✓" : `${percent}%`}
        </div>
    );
}

export default GoalCardSlop;
