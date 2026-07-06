"use client";

const FeedbackResponsesHeader = () => {
  return (
    <div className="flex justify-start sm:justify-between items-start sm:items-center gap-3 flex-col sm:flex-row">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold">Feedback Responses</h2>
        <p className="text-muted-foreground max-w-lg">
          These are the feedback from users about their experience using the
          application.
        </p>
      </div>
    </div>
  );
};

export default FeedbackResponsesHeader;
