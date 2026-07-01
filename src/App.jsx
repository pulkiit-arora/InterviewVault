import React, {useEffect, useState} from 'react'
import QuestionList from './components/QuestionList'
import Header from './components/Header'
import Hero from './components/Hero'
import SelectionPrompt from './components/SelectionPrompt'
import SelectSublevels from './components/SelectSublevels'
import HomeDetails from './components/HomeDetails'
import Footer from './components/Footer'

export default function App(){
  const [manifest, setManifest] = useState(null)
  const [error, setError] = useState(null)
  const [level, setLevel] = useState(null)
  const [tech, setTech] = useState(null)
  const [sublevel, setSublevel] = useState(null)
  const [dark, setDark] = useState(()=>{
    try{ return localStorage.getItem('iv-theme') === 'dark' }catch(e){return false}
  })

  useEffect(()=>{
    try{
      document.body.classList.toggle('dark-theme', dark)
      localStorage.setItem('iv-theme', dark ? 'dark' : 'light')
    }catch(e){}
  },[dark])

  useEffect(()=>{
    fetch('/questions/manifest.json')
      .then(r=> r.json())
      .then(data=>{
        setManifest(data)
      })
      .catch(e=> setError(e.message))
  },[])

  if(error) return <div className="app"><h2>Error loading manifest</h2><pre>{error}</pre></div>
  if(!manifest) return <div className="app"><h2>Loading...</h2></div>

  const toggleTheme = ()=> setDark(d=>!d)
  const handleTechSelection = (selectedLevel, selectedTech) => {
    setLevel(selectedLevel)
    setTech(selectedTech)
    setSublevel(null)
  }
  
  const handleSublevelSelection = (selectedSublevel) => {
    setSublevel(selectedSublevel)
  }
  
  const handleReset = (resetTo = null) => {
    if(resetTo === 'tech') {
      setTech(null)
      setSublevel(null)
    } else {
      setLevel(null)
      setTech(null)
      setSublevel(null)
    }
  }

  return (
    <div className="app">
      <Header appName="InterviewVault" levels={Object.keys(manifest.levels)} level={level} tech={tech} sublevel={sublevel} setLevel={setLevel} setTech={setTech} setSublevel={setSublevel} toggleTheme={toggleTheme} manifest={manifest} onReset={() => handleReset()} />
      {!level || !tech ? <Hero manifest={manifest} /> : null}
      <main>
        {!level || !tech ? (
          <HomeDetails manifest={manifest} onSelect={handleTechSelection} />
        ) : !sublevel ? (
          <SelectSublevels level={level} tech={tech} manifest={manifest} onSelect={handleSublevelSelection} onBack={() => handleReset('tech')} />
        ) : (
          <QuestionList manifest={manifest} level={level} tech={tech} sublevel={sublevel} setSublevel={setSublevel} onBack={() => setSublevel(null)} />
        )}
      </main>
      <Footer manifest={manifest} />
    </div>
  )
}
