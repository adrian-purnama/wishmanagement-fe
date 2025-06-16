const ConfirmDialog = ({ title = "Are you sure?", description, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        {description && <p className="mb-4 text-sm text-gray-600">{description}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="text-gray-500">
            Cancel
          </button>
          <button onClick={onConfirm} className="bg-red-600 text-white px-4 py-1 rounded">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
