import {
    Checkmark,
    TreeView,
    createTreeCollection,
    useTreeViewNodeContext,
    Spinner,
    Center,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { LuFile, LuFolder } from "react-icons/lu"
import { ClientsService, OrgUnitsService, PhoneBoothsService } from "@/client"

interface PhoneBoothTreeFilterProps {
    onCheckedChange?: (checkedItems: string[]) => void
}

interface Node {
    id: string
    name: string
    children?: Node[]
}

/* -------------------------------
    Queries
-------------------------------- */
function getClientsQuery() {
    return {
        queryKey: ["clients"],
        queryFn: () => ClientsService.readClients(),
    }
}

function getOrgUnitsQuery() {
    return {
        queryKey: ["orgUnits"],
        queryFn: () => OrgUnitsService.readOrgUnits(),
    }
}

function getPhoneBoothsQuery() {
    return {
        queryKey: ["phoneBooths"],
        queryFn: () => PhoneBoothsService.readPhoneBooths(),
    }
}

/* -------------------------------
    Helper: build hierarchical tree
-------------------------------- */
function buildTree(clients: any[], orgUnits: any[]): Node[] {
    const tree: Node[] = []

    for (const client of clients) {
        // Group org units belonging to this client
        const clientUnits = orgUnits.filter(
            (unit) => unit.client_id === client.id
        )

        // Build map of orgUnits by id for lookup
        const unitMap: Record<string, Node> = {}
        clientUnits.forEach((unit) => {
            unitMap[unit.id] = { id: unit.id, name: unit.name, children: [] }
        })

        // Connect children to parents
        const roots: Node[] = []
        clientUnits.forEach((unit) => {
            const node = unitMap[unit.id]
            if (unit.parent_id) {
                const parent = unitMap[unit.parent_id]
                if (parent) parent.children?.push(node)
            } else {
                roots.push(node)
            }
        })

        // Add client node with its org structure
        tree.push({
            id: client.id,
            name: client.name,
            children: roots,
        })
    }

    return tree
}

/* -------------------------------
    Checkbox Node Component
-------------------------------- */
const TreeNodeCheckbox = (props: TreeView.NodeCheckboxProps) => {
    const nodeState = useTreeViewNodeContext()
    return (
        <TreeView.NodeCheckbox aria-label="check node" {...props}>
            <Checkmark
                bg={{
                    base: "bg",
                    _checked: "colorPalette.solid",
                    _indeterminate: "colorPalette.solid",
                }}
                size="sm"
                checked={nodeState.checked === true}
                indeterminate={nodeState.checked === "indeterminate"}
            />
        </TreeView.NodeCheckbox>
    )
}

/* -------------------------------
    Main Component
-------------------------------- */
const PhoneBoothTreeFilter = ({ onCheckedChange }: PhoneBoothTreeFilterProps) => {
    const {
        data: clients,
        isLoading: clientsLoading,
        isError: clientsError,
    } = useQuery(getClientsQuery())

    const {
        data: orgUnits,
        isLoading: orgUnitsLoading,
        isError: orgUnitsError,
    } = useQuery(getOrgUnitsQuery())

    if (clientsLoading || orgUnitsLoading) {
        return (
            <Center p={4}>
                <Spinner />
            </Center>
        )
    }

    if (clientsError || orgUnitsError) {
        return <Center color="red.500">Failed to load tree data</Center>
    }

    // Build hierarchical structure
    const nodes = buildTree(clients || [], orgUnits || [])

    // Create Chakra Tree collection dynamically
    const collection = createTreeCollection<Node>({
        nodeToValue: (node) => node.id,
        nodeToString: (node) => node.name,
        rootNode: {
            id: "ROOT",
            name: "",
            children: nodes,
        },
    })

    return (
        <TreeView.Root
            collection={collection}
            maxW="sm"
            defaultCheckedValue={[]}
            onCheckedChange={(details) => {
                console.log("Checked in TreeView:", details.checkedValue)
                onCheckedChange?.(details.checkedValue)
            }}
        >
            <TreeView.Label>Organization Tree</TreeView.Label>
            <TreeView.Tree>
                <TreeView.Node
                    render={({ node, nodeState }) =>
                        nodeState.isBranch ? (
                            <TreeView.BranchControl role="none">
                                <TreeNodeCheckbox />
                                <LuFolder />
                                <TreeView.BranchText>{node.name}</TreeView.BranchText>
                            </TreeView.BranchControl>
                        ) : (
                            <TreeView.Item>
                                <TreeNodeCheckbox />
                                <LuFile />
                                <TreeView.ItemText>{node.name}</TreeView.ItemText>
                            </TreeView.Item>
                        )
                    }
                />
            </TreeView.Tree>
        </TreeView.Root>
    )
}

export default PhoneBoothTreeFilter
