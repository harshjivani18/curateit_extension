import React from 'react'
import './button.css'

const Button = (props) => {
    const { variant = 'primary', children, disabled, ...rest } = props
    return (
        <button disabled={disabled} className={`button ${variant}`} {...rest}>
            {children}
        </button>
    )
}

export default Button