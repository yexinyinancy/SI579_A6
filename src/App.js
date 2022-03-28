import { useRef, useState } from 'react';
/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 *
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 *
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
 function groupBy(objects, property) {
  // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
  // value for property (obj[property])
  if(typeof property !== 'function') {
      const propName = property;
      property = (obj) => obj[propName];
  }

  const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
  for(const object of objects) {
      const groupName = property(object);
      //Make sure that the group exists
      if(!groupedObjects.has(groupName)) {
          groupedObjects.set(groupName, []);
      }
      groupedObjects.get(groupName).push(object);
  }

  // Create an object with the results. Sort the keys so that they are in a sensible "order"
  const result = {};
  for(const key of Array.from(groupedObjects.keys()).sort()) {
      result[key] = groupedObjects.get(key);
  }
  return result;
}

function OutputItem(props){
  return (<li>{props.word} <button type='button' 
  className='btn btn-outline-success' onClick={props.onSave}>(save)</button></li>)
}

function pluralize(num) {
  if(num === 1) {
      return '';
  } else {
      return 's';
  }
}

function App() {
  const inputEl = useRef(null);
  const [description, setDescription] = useState('');
  const [saved, setSave] = useState([]);
  const [output, setOutput] = useState('');

  function saveWords(word){
    setSave(saved => saved.concat(word));
  }

  async function fetchResult(target){
    let fetchUrl = 'https://api.datamuse.com/words?rel_rhy=' + inputEl.current.value;

    if(target === 'rhyme'){
      setDescription(`Words that rhyme with ${inputEl.current.value}`);
    } else {
      setDescription(`Words with a similar meaning to ${inputEl.current.value}`);
      fetchUrl = 'https://api.datamuse.com/words?ml=' + inputEl.current.value;
    }
    setOutput(<span>loading...</span>);

    const response = await fetch(fetchUrl);
    const result = await response.json();

    setOutput('');
    if(result.length){
      if(target === 'rhyme'){
        const groupbyResult = groupBy(result, 'numSyllables');
        const groupbyOut = []
        for(const key in groupbyResult){
            groupbyOut.push(<h3 key={key}>{`${key} syllable${pluralize(parseInt(key))}:`}</h3>);
            groupbyOut.push(groupbyResult[key].map((item, i) => <OutputItem onSave={() => saveWords(item.word)} 
            key={i} word={item.word} /> ))
        }
        setOutput(groupbyOut);
      } else {
        setOutput(result.map((item, i) => <OutputItem onSave={() => saveWords(item.word)} 
        key={i} word={item.word} /> ));
      }
    } else {
      setOutput(<span>(no result)</span>);
    }
  }

  function onKeydown(event) {
    if(event.key === 'Enter') {
        fetchResult('rhyme');
    }
  }

  return (
    <div>
      <main className="container">
        <h1 className="row">React Rhyme Finder (579 Problem Set 6)</h1>
        <div className="row">
            <div className="col">Saved words: <span>{saved.length ? saved.join(', ') : '(none)'}</span></div>
        </div>
        <div className="row">
            <div className="input-group col">
                <input className="form-control" type="text" placeholder="Enter a word" onKeyDown={onKeydown} 
                ref={inputEl}/>
                <button type="button" className="btn btn-primary" 
                onClick={() => fetchResult('rhyme')}>Show rhyming words</button>
                <button type="button" className="btn btn-secondary" 
                onClick={() => fetchResult('synonym')}>Show synonyms</button>
            </div>
        </div>
        <div className="row">
            <h2 className="col">{description}</h2>
        </div>
        <div className="output row">
            <output className="col">{output}</output>
        </div>
    </main>
    </div>
  );
}

export default App;
