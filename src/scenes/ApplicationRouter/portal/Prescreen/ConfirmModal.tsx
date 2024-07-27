import { Typography } from "@mui/material";
import React from "react"
import Button from "src/components/common/button/Button";
import DialogBox from "src/components/common/DialogBox/DialogBox";
import strings from "src/strings";


export type NewApplicationModalProps = {
  open: boolean;
  title: string;
  body: string;
  onClose: () => void;
  onConfirm: () => void;
};


const ConfirmModal = ({open, title, body, onClose, onConfirm} : NewApplicationModalProps) => {
  return <DialogBox
    onClose={onClose}
    open={open}
    title={title}
    message={body}
    size='medium'
    middleButtons={[
      <Button
        id='cancel'
        label={strings.CANCEL}
        priority='secondary'
        type='passive'
        onClick={onClose}
        key='cancel-button'
      />,
      <Button id='submit' label={strings.SUBMIT} onClick={onConfirm} key='submit-button' />,
    ]}
  />
}

export default ConfirmModal;