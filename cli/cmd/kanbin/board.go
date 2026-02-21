package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/your-org/kanbin/cli/internal/client"
)

func newBoardCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "board",
		Short: "Manage kanban boards",
	}

	cmd.AddCommand(newBoardCreateCmd())
	cmd.AddCommand(newBoardViewCmd())
	cmd.AddCommand(newBoardDeleteCmd())

	return cmd
}

func newBoardCreateCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "create [title]",
		Short: "Create a new board",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			title := args[0]
			var result struct {
				Key   string `json:"key"`
				Title string `json:"title"`
			}
			err := client.Post("/boards", map[string]string{"title": title}, &result)
			if err != nil {
				fmt.Printf("Error creating board: %v\n", err)
				os.Exit(1)
			}
			fmt.Printf("Board created successfully!\n")
			fmt.Printf("Title: %s\n", result.Title)
			fmt.Printf("Key:   %s\n", result.Key)
		},
	}
}

func newBoardViewCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "view [key]",
		Short: "View a board and its tasks",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			key := args[0]
			var result struct {
				Key   string `json:"key"`
				Title string `json:"title"`
				Tasks []struct {
					ID          string `json:"id"`
					Title       string `json:"title"`
					Status      string `json:"status"`
					Description string `json:"description"`
				} `json:"tasks"`
			}
			err := client.Get(fmt.Sprintf("/boards/%s", key), &result)
			if err != nil {
				fmt.Printf("Error fetching board: %v\n", err)
				os.Exit(1)
			}
			
			fmt.Printf("=== %s [%s] ===\n\n", result.Title, result.Key)
			if len(result.Tasks) == 0 {
				fmt.Println("No tasks on this board.")
				return
			}
			
			fmt.Printf("%s \t| %s \t| %s \t| %s\n", "ID", "STATUS", "TITLE", "DESCRIPTION")
			fmt.Println("------------------------------------------------")
			for _, t := range result.Tasks {
				fmt.Printf("%s | %s \t| %s \t| %s\n", t.ID, t.Status, t.Title, t.Description)
			}
		},
	}
}

func newBoardDeleteCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "delete [key]",
		Short: "Delete a board",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			key := args[0]
			var result map[string]string
			err := client.Delete(fmt.Sprintf("/boards/%s", key), &result)
			if err != nil {
				fmt.Printf("Error deleting board: %v\n", err)
				os.Exit(1)
			}
			fmt.Printf("Board %s deleted successfully.\n", key)
		},
	}
}
