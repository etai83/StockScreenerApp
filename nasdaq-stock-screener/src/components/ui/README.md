# UI Components Library

This directory contains reusable UI components built with React, TypeScript, and Tailwind CSS. Components follow modern design patterns and are optimized for the stock screener application.

## Available Components

### Core Components

#### Button (`button.tsx`)
Versatile button component with multiple variants and sizes.
```typescript
<Button variant="default" size="md" onClick={handleClick}>
  Click Me
</Button>
```

#### Input (`input.tsx`)
Form input component with consistent styling.
```typescript
<Input 
  type="text" 
  placeholder="Enter stock symbol" 
  value={value}
  onChange={handleChange}
/>
```

#### Badge (`badge.tsx`)
Small status indicators for displaying categories or states.
```typescript
<Badge variant="default">Active</Badge>
<Badge variant="destructive">Error</Badge>
```

### Layout Components

#### Card (`card.tsx`)
Container component for grouping related content.
```typescript
<Card>
  <CardHeader>
    <CardTitle>Stock Details</CardTitle>
    <CardDescription>Current market information</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
</Card>
```

#### Table (`table.tsx`)
Data table component with sorting capabilities.
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Symbol</TableHead>
      <TableHead>Price</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>AAPL</TableCell>
      <TableCell>$150.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Interactive Components

#### Dialog (`dialog.tsx`)
Modal dialog for displaying detailed information.
```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Stock Details</DialogTitle>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

#### Select (`select.tsx`)
Dropdown selection component with search capabilities.
```typescript
<Select value={selected} onValueChange={setSelected}>
  <SelectTrigger>
    <SelectValue placeholder="Choose option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Tooltip (`tooltip.tsx`)
Contextual information overlay.
```typescript
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      Additional information here
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Utility Components

#### Spinner (`spinner.tsx`)
Loading indicator with customizable size and variants.
```typescript
<Spinner size="md" variant="primary" />
```

## Design System

### Color Variants
- **Default**: Standard neutral colors
- **Primary**: Brand colors (blue)
- **Secondary**: Secondary brand colors (green)
- **Destructive**: Error states (red)
- **Outline**: Subtle borders

### Size Options
- **sm**: Small (compact interfaces)
- **md**: Medium (default)
- **lg**: Large (prominent actions)

## Dependencies

The UI components rely on:
- **@radix-ui/react-dialog**: Accessible dialog primitives
- **@radix-ui/react-select**: Accessible select primitives  
- **@radix-ui/react-tooltip**: Accessible tooltip primitives
- **@radix-ui/react-slot**: Polymorphic component utilities
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Intelligent Tailwind class merging

## Usage Notes

1. All components are server-side rendering compatible
2. Components use `forwardRef` for proper ref handling
3. Styling uses Tailwind CSS with consistent design tokens
4. Components follow accessibility best practices
5. TypeScript support with proper type exports

## Contributing

When adding new components:
1. Follow the existing naming convention
2. Use TypeScript for type safety
3. Include proper accessibility attributes
4. Document component props and usage
5. Test with various screen sizes
6. Ensure consistent styling with design system

## Testing

Components can be tested using:
```bash
npm run build  # Verify TypeScript compilation
npm run lint   # Check code quality
```
