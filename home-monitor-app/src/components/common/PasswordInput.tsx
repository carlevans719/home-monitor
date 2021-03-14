import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';

const PasswordInput = ({ initialValue = '', onChangeText = (str: string) => {} }) => {
  const [password, setPassword] = useState(initialValue);
  const [passwordIsInvalid, setPasswordIsInvalid] = useState(false);

  const validatePassword = (str) => {
    if (str) {
      setPasswordIsInvalid(str.length < 5);
    }
  };

  const updatePassword = str => {
    setPassword(str);
    if (passwordIsInvalid) {
      validatePassword(str);
    } else {
      onChangeText(str);
    }
  };

  return (
    <TextInput
      label="Password"
      mode='outlined'
      error={passwordIsInvalid}
      onChangeText={updatePassword}
      onBlur={() => validatePassword(password)}
      autoCompleteType='password'
      secureTextEntry
      value={password}
    />
  )
}

export default PasswordInput;