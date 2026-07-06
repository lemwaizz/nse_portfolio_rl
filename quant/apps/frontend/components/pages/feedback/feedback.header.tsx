const FeedbackHeader = () => {
  return (
    <div className="flex justify-start sm:justify-between items-start sm:items-center gap-3 flex-col sm:flex-row">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold">Feedback</h2>
        <p className="text-muted-foreground max-w-lg">
          Your feedback on your experience using the app helps us improve our
          services
        </p>
      </div>
    </div>
  );
};

export default FeedbackHeader;
