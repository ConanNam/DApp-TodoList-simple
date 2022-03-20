import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

function ModalUpdate(props) {

    const [task, setTask] = useState("")

    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Edit Task
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type='text'
          defaultValue={props.item.item?.message}
          onChange = {(e) => setTask(e.target.value)}/>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => {
              let item = {...props.item.item, message:task}
              let index = props.item.index
              props.onUpdate(item,index,false)
              }}>Save</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  export default ModalUpdate