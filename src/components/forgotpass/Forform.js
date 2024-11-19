import React, { useState } from 'react'
import Button from '../Button/Button'
import InputWithIcon from '../inputWithIcon/InputWithIcon'
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux";
import { forgot } from "../../actions/login";
import { FIELD_REQUIRED } from "../../utils/constants";
import { Validator } from "../../utils/validations";
import { message } from 'antd';

const Forform = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [userError, setUserError] = useState("");
  const [loading, setLoading] = useState(false)

  const handleUserChange = (val) => {
    setEmail(val)
    setUserError(Validator.validate("email", val, null, null, true));
  };


  const submitData = async (e) => {
    e.preventDefault();
    if (
      userError !== "" ||
      email === "" 
    ) {
      if (email === "") {
        setUserError(FIELD_REQUIRED);
      } else {
        setUserError(userError);
      }
      return;
    }
    setLoading(true);
    if (email !== "") {
      try {
        const res = await dispatch(forgot(email));
        setLoading(false);
        if(res.payload.status === 200){
          navigate("/login");
          message.success("We have sent an email to your email address. Please check your email to reset your password.")
        }
      } catch (error) {
        setLoading(false);
      }
    }
  };


  return (
    <>
      <div className='py-5'>
        <div className='mb-5'>
          <InputWithIcon value={email} onChange={(val) => handleUserChange(val)} type="email" name="email" placeholder="Email" />
          <span className="error-label">{userError}</span>
        </div>
      </div>
     
      <div className='mt-5'>
        <Button  onClick={submitData} disabled={loading} variant="primary w-full">{loading ? `Loading...` : "Submit"}</Button>
      </div>
    </>
  )
}

export default Forform