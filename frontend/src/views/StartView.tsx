import React, { useState } from 'react'

type Props = {

}

const StartView = (props: Props) => {
  const [newInterest, setNewInterest] = useState('');

  async function addInterest() {
    const user = localStorage.getItem('user');
    const userInterestObject:object = {
      user: user,
      interest: newInterest
    };
    const response = await fetch('http://localhost:1234/addinterest', {
      method: 'POST',
      body: JSON.stringify(userInterestObject),
      headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    console.log(data);
    
    
  }
  return (
    <div>
      <h1>Välkommen</h1>
      <section>
        <label htmlFor="interest-input"></label>
        <input onChange={(e) => setNewInterest(e.target.value)} type="text" id="interest-input" placeholder='Ange intresse'/>
        <button onClick={addInterest}>Lägg till intresse</button>
      </section>
    </div>
  )
}

export default StartView