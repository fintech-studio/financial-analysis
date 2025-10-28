import React from "react";
import { motion } from "framer-motion";
import { Icons } from "@/components/PageComponents/ChatPage/ChatCommon";

interface FileEntry {
  name: string;
  type: string;
  content: string;
}

interface Props {
  attachedFiles: FileEntry[];
  attachedImages: string[];
  removeAttachedFile: (index: number) => void;
  removeAttachedImage: (index: number) => void;
}

const AttachPreview: React.FC<Props> = ({
  attachedFiles,
  attachedImages,
  removeAttachedFile,
  removeAttachedImage,
}) => {
  if (attachedFiles.length === 0 && attachedImages.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl"
    >
      <div className="text-sm text-gray-600 mb-3 font-medium">附加的檔案:</div>

      {attachedImages.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {attachedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={`data:image/jpeg;base64,${image}`}
                  alt={`預覽 ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                />
                <button
                  onClick={() => removeAttachedImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <Icons.Remove />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {attachedFiles.length > 0 && (
        <div className="space-y-2">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Icons.File />
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500">{file.type}</div>
                </div>
              </div>
              <button
                onClick={() => removeAttachedFile(index)}
                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
              >
                <Icons.Remove />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AttachPreview;
