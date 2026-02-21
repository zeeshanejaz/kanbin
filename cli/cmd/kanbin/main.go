package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/your-org/kanbin/cli/internal/client"
)

func main() {
	var serverAddr string

	var rootCmd = &cobra.Command{
		Use:   "kanbin",
		Short: "Kanbin is a CLI for ephemeral key-based kanban boards.",
		PersistentPreRun: func(cmd *cobra.Command, args []string) {
			if serverAddr != "" {
				client.SetBaseURL(serverAddr)
			}
		},
		Run: func(cmd *cobra.Command, args []string) {
			cmd.Help()
		},
	}

	rootCmd.PersistentFlags().StringVarP(&serverAddr, "server", "s", "", "Backend server URL (overrides KANBIN_URL and default)")

	// Will attach subcommands here
	rootCmd.AddCommand(newBoardCmd())
	rootCmd.AddCommand(newTaskCmd())

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
