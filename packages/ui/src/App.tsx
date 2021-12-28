import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import {ExpenseItem} from "./component/ExpenseItem";

const Copyright = () => (
    <Typography variant="body2" color="text.secondary" align="center">
        {'Copyright © '}
        <Link color="inherit" href="https://www.linkedin.com/in/amarendra-kumar-25117217/">
            Talk to Amar at
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
    </Typography>
);

export default function App() {
  return (
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Expensify
              <ExpenseItem/>
          </Typography>
          <Copyright />
        </Box>
      </Container>
  );
}
