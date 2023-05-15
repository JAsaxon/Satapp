import React, { useEffect, useState, useRef } from "react";
import WordsJson from "../data/words.json";

const Quiz = () => {
  const Words = WordsJson.results;
  const [currentWord, setcurrentWord] = useState("");
  const [finishedWordCollection, setfinishedWordCollection] = useState(false);
  const [currentWordDefinition, setcurrentWordDefinition] = useState("");
  const [RelWordDefinition, setRelWordDefinition] = useState([
  ]);
  const [relWords, setrelWords] = useState([]);
  const [Score, setScore] = useState({
    score: 0,
    maxScore: 0,
  });

  const [show, setShow] = useState(false);
  const dictKey = import.meta.env.VITE_APP_DICT_API;
  const thesKey = import.meta.env.VITE_APP_THES_API;

  const usedWords = new Set();
  const getRelatedWords = async () => {
    while (true) {
      try {
        const wordObject = Words[Math.floor(Math.random() * Words.length)];
        const newWord = wordObject.word;
        const res = await fetch(
          `https://www.dictionaryapi.com/api/v3/references/ithesaurus/json/${newWord}?key=${thesKey}`
        );
        if (!res.ok) {
          console.log(`Response failed with status ${res.status}`);
          continue;
        }
        const data = await res.json();

        let rel = await data[0]?.def[0]?.sseq[0][0][1]?.rel_list?.flat();
        if (rel && rel.length >= 3) {
          setcurrentWord(newWord);
          setcurrentWordDefinition(wordObject.definition);
          setrelWords(rel.slice(0, 3));
          setfinishedWordCollection(true);
          break;
        }
      } catch (e) {
        console.log(e);
      }
    }
  };
  const getWordDefinition = async (word) => {
    try {
      const res = await fetch(
        `https://www.dictionaryapi.com/api/v3/references/sd3/json/${word}?key=${dictKey}`
      );
      if (!res.ok) {
        console.log(`Response failed with status ${res.status}`);
      }
      const def = await res.json();
      return def;
    } catch (e) {}
  };
  useEffect(() => {
    //get 1 currentWord and 3 related words
    getRelatedWords();
  }, []);
  useEffect(() => {
    if (currentWord !== "") {
      getWordDefinition(currentWord).then((def) => {
        setcurrentWordDefinition(def[0].shortdef[0]);
      });
    }
    if (relWords.length === 3) {
      const relWordsDefinitionsPromises = relWords.map((el) => {
        return getWordDefinition(el.wd).then((def) => {
          return def[0].shortdef[0];
        });
      });
      Promise.all(relWordsDefinitionsPromises).then((relWordsDefinitions) => {
        setRelWordDefinition(
          concatAndShuffle(relWordsDefinitions, currentWordDefinition)
        );
      });
    }
  }, [finishedWordCollection, relWords, currentWordDefinition]);

  function concatAndShuffle(array, value) {
    // Concatenate the array with the value
    let newArray = array.concat(value);

    // Use the Fisher-Yates (aka Knuth) Shuffle algorithm to shuffle the array
    for (let i = newArray.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }

    return newArray;
  }
  function ChoiceClick(el) {
    setShow(true);

    if (el === currentWordDefinition) {
      setScore({
        score: Score.score + 1,
        maxScore: Score.maxScore + 1,
      });
    } else {
      setScore({
        ...Score,
        maxScore: Score.maxScore + 1,
      });
    }
    setTimeout(() => {
      setShow(false);

      getRelatedWords();
    }, 1500);
  }
  let className = ""
  useEffect(() => {
    if(show){
      className = "correct"
      setTimeout(()=> {
        className = ""
      },1000)
    }
  }, [show])
  
  return (
    <div className="quiz-card">
      <div className={`Score ${className}`}>
        {Score.score}/{Score.maxScore}
      </div>
      <h1>{currentWord}</h1>
      <div className="choices-container">
        {RelWordDefinition.map((el, i) => {
          const fontSize = el.length > 35 ? "10px" : "14px";
          return (
            <button
              onClick={(e) => {
                ChoiceClick(el);
                setTimeout(() => {
                    e.target.blur();
                }, 1000);
              }}
              tabIndex="0"
              className={`choice ${
                el === currentWordDefinition ? "right" : "wrong"
              } ${show ? "show" : ""}`}
              style={{ fontSize }}
            >
              <div>{el}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Quiz;
