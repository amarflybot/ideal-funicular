import './ExpenseItem.css'

// @ts-ignore
export const ExpenseItem = ({x}) => {
    return (
        <div className="expense-item">
            <div>Date</div>
            <div className="expense-item__description">
                <h2>Title {x}</h2>
                <div className="expense-item__price">Amount</div>
            </div>
        </div>
    )
}
