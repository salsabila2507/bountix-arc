export type TaskFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: {
    title?: string;
    description?: string;
    category?: string;
    reward_amount?: string;
    status?: string;
    task_type?: string;
    external_link?: string;
    start_date?: string;
    end_date?: string;
  };
  taskId?: string;
};

export const initialTaskFormState: TaskFormState = {
  status: "idle",
  message: "",
};
