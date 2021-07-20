import {Form, Button, Table} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import axios from "axios";

let lastRequestIntervalID = null;

function MainController() {

    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const [subscribedInstruments, setSubscribedInstruments] = useState([]);
    const [instrumentsData, setInstrumentsData] = useState([]);

    useEffect(() => {
        if (lastRequestIntervalID !== null) {
            clearTimeout(lastRequestIntervalID);
        }
        if (subscribedInstruments.length !== 0) {
            const params = {
                params: {
                    instrument_array: subscribedInstruments.join(",")
                }
            }

            async function updateThenRequestAgain() {
                try {
                   const response = await axios.get("http://localhost:7072/getdatafromdatabase", params);
                   setInstrumentsData(response.data);
                } catch (err) {
                    console.log(err)
                } finally {
                    lastRequestIntervalID = setTimeout(updateThenRequestAgain, 1000, params);
                }
            }
            updateThenRequestAgain().catch(() => {
            });
        }
    }, [subscribedInstruments])

    useEffect(() => {
        axios.get("http://localhost:7072/getinstrument")
            .then(function (res) {
                const instruments = res.data.map(e => e.NAME);
                setSelectedInstrument(instruments[0]);
                setInstruments(instruments);
            })
    }, []);

    const prepareArray = instrumentsData.map((element) => <tr key={element.Name}>
        <td>{element.Name}</td>
        <td>{element.BID}</td>
        <td>{element.ASK}</td>
        <td>{element.Time}</td>
    </tr>)

    const options = instruments.map((element) => <option key={element} value={element}>{element}</option>)

    const appendIfNotExists = (what) => {
        if (subscribedInstruments.indexOf(what) === -1) {
            return [...subscribedInstruments, selectedInstrument]
        }
        return subscribedInstruments;
    }

    return <>
        <Form.Group className={"mt-3"}>
            <Form.Label>Choose instrument to subscribe</Form.Label>
            <select id="Kurva" className="form-control"
                    onChange={e => setSelectedInstrument(e.target.options[e.target.selectedIndex].value)}>{options}</select>
            <Form.Label>You can subscribe only on 150 instrument</Form.Label>
            <div className={"mt-3"}>
                <Button variant="primary" className={"mx-1"}
                        onClick={() => setSubscribedInstruments(appendIfNotExists(selectedInstrument))}>Subscribe</Button>
                <Button variant="primary" disabled={true}>Unsubscribe</Button>
            </div>
            <Table>
                <thead>
                <tr>
                    <th>Instrument</th>
                    <th>Best current bid</th>
                    <th>Best current ask</th>
                    <th>Time</th>
                </tr>
                </thead>
                <tbody>
                    {prepareArray}
                </tbody>
            </Table>
        </Form.Group>
    </>
}

export default MainController;