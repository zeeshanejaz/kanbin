package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

func main() {
	var rootCmd = &cobra.Command{
		Use:   "kanbin",
		Short: "Kanbin is a CLI for ephemeral key-based kanban boards.",
		Run: func(cmd *cobra.Command, args []string) {
			cmd.Help()
		},
	}

	// Will attach subcommands here
	rootCmd.AddCommand(newBoardCmd())
	rootCmd.AddCommand(newTaskCmd())

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
