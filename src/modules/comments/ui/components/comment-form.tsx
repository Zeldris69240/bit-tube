import { useUser, useClerk } from "@clerk/nextjs";
import { z } from "zod";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { trpc } from "@/trpc/client";
import { Textarea } from "@/components/ui/textarea";
import { commentInsertSchema } from "@/db/schema";
import { UserAvatar } from "@/components/user-avatar";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

interface CommentFormProps {
    videoId: string;
    onSuccess?: () => void;
}

export const CommentForm = ({
    videoId,
    onSuccess,
}: CommentFormProps) => {
    
    const { user } = useUser();

    const clerk = useClerk();
    

    const utils = trpc.useUtils();

    const create = trpc.comments.create.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate({ videoId });
            form.reset();
            toast.success("Comment created!");  
            onSuccess?.();       
        },
        onError: (error) => {
            toast.error("Something went wrong");

            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });

    const formSchema = commentInsertSchema.omit({
        userId: true,
        id: true,
        createdAt: true,
        updatedAt: true,
      });
      
      const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          videoId,
          value: "",
        },
      });

      

      const handleSubmit = (values: z.infer<typeof formSchema>) => {
        if (!user?.id) {
          toast.error("Please sign in to comment");
          return;
        }
      
        const fullValues: z.infer<typeof commentInsertSchema> = {
            ...values,
            userId: user.id,
          };
          
          create.mutate(fullValues);          
      };
    return (
        <Form {...form} >
            <form 
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex gap-4 group">
                <UserAvatar 
                size="lg"
                imageUrl={user?.imageUrl || "/user-placeholder.svg"}
                name={user?.username || "User"}
                />
                <div className="flex-1">
                    <FormField 
                    name="value"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <Textarea 
                            { ...field }
                            placeholder="Add a Comment..."
                            className="resize-none bg-transparent overflow-hidden min-h-0"
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="justify-end gap-2 mt-2 flex">
                        <Button
                        disabled={create.isPending}
                        type="submit"
                        size="sm"
                        >
                            Comment
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}; 
