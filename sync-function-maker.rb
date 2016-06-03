#!/usr/bin/env ruby

# Extract the command line parameters
unless ARGV.length == 2
  puts "Usage: #{$0} sync_document_definitions_file output_file"
  puts "For example: #{$0} my-sync-doc-definitions.js my-sync-function.js"

  exit!
end

current_working_directory = File.dirname(File.absolute_path $0)
sync_doc_defn_filename = ARGV[0]
output_filename = ARGV[1]

# Read the sync documents definition file
sync_doc_defn = ""
begin
  File.open(sync_doc_defn_filename, "r") do |sync_doc_defn_file|
    while line = sync_doc_defn_file.gets
      sync_doc_defn << (line + "  ")  # Add some spaces so the content will be indented normally when it's injected into the template
    end
  end
rescue => err
  puts "Unable to read the sync document definitions file: #{err}"
  exit!
end

# Read the sync function template file
sync_func_template = ""
begin
  File.open(current_working_directory + "/sync-function-template.js", "r") do |sync_func_template_file|
    while line = sync_func_template_file.gets do
      sync_func_template << line
    end
  end
rescue => err
  puts "Unable to read the sync function template file: #{err}"
  exit!
end

# Inject the sync documents definition content into the sync function template
sync_func_template.gsub!("%SYNC_DOCUMENT_DEFINITIONS%", sync_doc_defn);

# Write the completed sync function to the output file path
begin
  File.open(output_filename, "w") do |output_file|
    output_file.puts sync_func_template
  end
rescue => err
  puts "Unable to write the sync function to the output file: #{err}"
  exit!
end

puts "Sync function written to #{current_working_directory}/#{output_filename}"
