import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  columns: string[];
  onRedirect?: () => void;
}

export function DataTable({ title, data, columns, onRedirect }: DataTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              A summary of {title.toLowerCase()} information.
            </CardDescription>
          </div>
          {onRedirect && (
            <Button variant="outline" size="sm" onClick={onRedirect}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <h3 className="text-lg font-semibold">No data found</h3>
            <p className="text-muted-foreground">
              There is currently no information to display.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column} className="whitespace-nowrap">
                        {row[column.toLowerCase().replace(/\s+/g, "_")] ||
                          row[column]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
