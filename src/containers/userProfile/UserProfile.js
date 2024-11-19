import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { updateUser } from "../../actions/user"
import { Validator } from "../../utils/validations"
import LayoutCommon from "../../components/commonLayout/LayoutCommon"
import BackHeader from "../../components/backHeader/BackHeader"
import Input from "../../components/input/Input"
import Button from "../../components/Button/Button"

export const UserProfile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state?.user?.userData)
  const [firstName, setFirstName] = useState(user?.firstname || "")
  const [lastName, setLastName] = useState(user?.lastname || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({});

  const handleFirstName = (val) => {
    setFirstName(val.target.value)
    setError({...error, firstName: ""})
  }
  const handleLastName = (val) => {
    setLastName(val.target.value)
     setError({ ...error, lastName: "" })
  }

  const submitData = () => {
    if (Validator.validate("namewithoutspace", firstName, null, null, true)) {
      setError({
        firstName: Validator.validate(
          "namewithoutspace",
          firstName,
          null,
          null,
          true
        ),
      })
    } else if (Validator.validate("namewithoutspace", lastName, null, null, true)) {
      setError({
        lastName: Validator.validate(
          "namewithoutspace",
          lastName,
          null,
          null,
          true
        ),
      })
    } else {
      setLoading(true)
      const data = {
        firstname: firstName,
        lastname: lastName,
      }
      dispatch(updateUser(data)).then((res) => {
        setLoading(false)
        navigate("/setting")
      })
    }
  }
  return (
    <LayoutCommon>
      <BackHeader backUrl="/setting" />
      <div className="p-4 text-[#062046]">
        <div className="py-4">
          <div className="mb-4">
            <Input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={firstName}
              onChange={(val) => handleFirstName(val)}
              size="w-full medium"
            />
            <span className="error-label">{error?.firstName}</span>
          </div>
          <div className="mb-4">
            <Input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={lastName}
              onChange={(val) => handleLastName(val)}
              size="w-full medium"
            />
            <span className="error-label">{error?.lastName}</span>
          </div>
          <div className="mb-4">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={user?.email || ""}
              disabled={true}
              size="w-full medium"
            />
          </div>
        </div>
        <Button
          variant="primary w-full"
          disabled={loading}
          onClick={submitData}
        >
          {loading ? `Updating...` : "Update"}
        </Button>
      </div>
    </LayoutCommon>
  )
}
