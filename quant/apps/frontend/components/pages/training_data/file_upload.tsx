"use client";

import { File, Trash } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";

import { Button } from "@frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@frontend/components/ui/card";
import { Input } from "@frontend/components/ui/input";
import { Label } from "@frontend/components/ui/label";
import { Separator } from "@frontend/components/ui/separator";
import { cn } from "@frontend/lib/utils";
import { toast } from "sonner";
import { apiClient } from "@/packages/clients/src";
import { BarLoaderFullScreenWidth } from "@frontend/components/ui/bar_loader";

export default function FileUpload03() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [year, setYear] = React.useState<number>();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => setFiles(acceptedFiles),
  });

  const filesList = files.slice(0, 1).map((file) => (
    <li key={file.name} className="relative">
      <Card className="relative p-4 shadow-none">
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove file"
            onClick={() =>
              setFiles((prevFiles) =>
                prevFiles.filter((prevFile) => prevFile.name !== file.name),
              )
            }
          >
            <Trash className="h-5 w-5" aria-hidden={true} />
          </Button>
        </div>
        <CardContent className="flex items-center space-x-3 p-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <File className="h-5 w-5 text-foreground" aria-hidden={true} />
          </span>
          <div>
            <p className="text-pretty font-medium text-foreground">
              {file.name}
            </p>
            <p className="text-pretty mt-0.5 text-sm text-muted-foreground">
              {file.size} bytes
            </p>
          </div>
        </CardContent>
      </Card>
    </li>
  ));

  return (
    <div className="p-10">
      {isLoading && <BarLoaderFullScreenWidth loading={isLoading} />}
      <Card className="sm:mx-auto sm:max-w-xl shadow-none">
        <CardHeader>
          <CardTitle>Upload new Dataset</CardTitle>
          <CardDescription>
            Ensure CSV Headers match the Nse Alpha Standard Schema for optimal
            processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="#"
            method="post"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!year) {
                toast.error("Provide a year to continue", {
                  className: "text-foreground",
                });
                return;
              }
              if (files.length <= 0) {
                toast.error("Select a file to continue", {
                  className: "text-foreground",
                });
                return;
              }
              try {
                setIsLoading(true);
                const { error } = await apiClient.api.dataset.post({
                  file: files[0]!,
                  year: year.toString(),
                });
                if (error) {
                  toast.error("Dataset upload errored", {
                    className: "text-foreground",
                  });
                  return;
                }
                toast.success("Successfully uploaded dataset", {
                  className: "text-foreground",
                });
              } catch (error) {
                console.log(error);
                toast.error("Something went wrong, please try again later", {
                  className: "text-foreground",
                });
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full">
                <Label htmlFor="dataset-year" className="font-medium">
                  Dataset Year
                </Label>
                <Input
                  type="number"
                  id="dataset-year"
                  name="dataset-year"
                  placeholder="Which year is this dataset from?"
                  className="mt-2"
                  value={year ?? ""}
                  onChange={(e) => {
                    e.preventDefault();
                    setYear(Number(e.target.value));
                  }}
                />
              </div>
              <div className="col-span-full">
                <Label htmlFor="file-upload-2" className="font-medium">
                  File(s) upload
                </Label>
                <div
                  {...getRootProps()}
                  className={cn(
                    isDragActive
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border",
                    "mt-2 flex justify-center rounded-md border border-dashed px-6 py-20 transition-colors duration-200",
                  )}
                >
                  <div>
                    <File
                      className="mx-auto h-12 w-12 text-muted-foreground/80"
                      aria-hidden={true}
                    />
                    <div className="mt-4 flex text-muted-foreground">
                      <p>Drag and drop or</p>
                      <label
                        htmlFor="file"
                        className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:text-primary/80 hover:underline hover:underline-offset-4"
                      >
                        <span>choose file(s)</span>
                        <input
                          {...getInputProps()}
                          id="file-upload-2"
                          name="file-upload-2"
                          type="file"
                          className="sr-only"
                          accept=".csv"
                        />
                      </label>
                      <p className="text-pretty pl-1">to upload</p>
                    </div>
                  </div>
                </div>
                <p className="text-pretty mt-2 text-sm leading-5 text-muted-foreground sm:flex sm:items-center sm:justify-between">
                  <span>Only .csv file types are allowed to upload.</span>
                  <span className="pl-1 sm:pl-0">Max. size per file: 50MB</span>
                </p>
                {filesList.length > 0 && (
                  <>
                    <h4 className="text-balance mt-6 font-medium text-foreground">
                      File(s) to upload
                    </h4>
                    <ul role="list" className="mt-4 space-y-4">
                      {filesList}
                    </ul>
                  </>
                )}
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex items-center justify-end space-x-3">
              {/* <Button type="button" variant="outline">
                Cancel
              </Button> */}
              <Button type="submit">Upload</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
