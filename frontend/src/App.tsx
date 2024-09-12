
function App() {
 

  return (
    <main>
      <div>
      <h1>Video Player</h1>
      <video
        id="videoPlayer"
        width="50%"
        controls
        muted
        autoPlay
      >
        <source src="http://localhost:8080/video" type="video/mp4" />
      </video>
    </div>
    </main>
  )
}

export default App
