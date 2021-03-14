import React, { useState } from 'react';
import { TextInput as RNPTextInput } from 'react-native-paper';

type TextInput = (params: { label: string, initialValue: string, onChangeText: Function }) => JSX.Element;
const TextInput: TextInput = ({ label, initialValue = '', onChangeText = (str: string) => {} }) => {
  const [text, setText] = useState(initialValue);
  const [textIsInvalid, setTextIsInvalid] = useState(false);

  const validateText = (str: string) => {
    setTextIsInvalid(!!str);
  };

  const updateText = (str: string) => {
    setText(str);
    if (textIsInvalid) {
      validateText(str);
    } else {
      onChangeText(str);
    }
  };

  return (
    <RNPTextInput
      label={label}
      mode='outlined'
      error={textIsInvalid}
      onChangeText={updateText}
      onBlur={() => validateText(text)}
      value={text}
    />
  )
};

export default TextInput;