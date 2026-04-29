function LoadingStatus({ theme }) {
  return (
    <div className="loading-container">
      <h2 className="loading-title">
        ✨ Crafting your <span>{theme}</span> story...
      </h2>

      <div className="wave">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <p className="loading-info">Generating story...</p>
    </div>
  );
}

export default LoadingStatus;
